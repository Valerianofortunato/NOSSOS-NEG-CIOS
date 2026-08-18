import { supabase } from '../lib/supabase';
import { DataService } from './DataService';
import type { User } from '../types';

const AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';

function profileToUser(row: any): User {
  return {
    id: row.id,
    name: row.name || 'Utilizador',
    email: row.email || '',
    phone: row.phone || '',
    accountType: row.account_type || 'cliente',
    referralCode: row.referral_code,
    referralsCount: Number(row.referrals_count || 0),
    isVerified: !!row.is_verified,
    isSuspended: !!row.is_suspended,
    isAdmin: !!row.is_admin,
    avatar: row.avatar || AVATAR,
    rating: Number(row.rating || 5),
    ratingsCount: Number(row.ratings_count || 0),
    walletBalance: Number(row.wallet_balance || 0),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

async function profileForAuthUser(authUser: any): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return profileToUser(data);

  const metadata = authUser.user_metadata || {};
  const profile = {
    id: authUser.id,
    name: metadata.name || authUser.email?.split('@')[0] || 'Utilizador',
    email: (authUser.email || '').toLowerCase(),
    phone: metadata.phone || '',
    account_type: metadata.account_type || 'cliente',
    referral_code: metadata.referral_code || `REF-${authUser.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
    avatar: metadata.avatar || AVATAR,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();

  if (insertError) throw insertError;
  return profileToUser(inserted);
}

export function installRealSupabaseAuth() {
  const original = {
    signUp: DataService.signUp,
    signIn: DataService.signIn,
    signOut: DataService.signOut,
    getCurrentSessionUser: DataService.getCurrentSessionUser,
    resetPassword: DataService.resetPassword,
    updatePassword: DataService.updatePassword,
    updateEmail: DataService.updateEmail,
  };

  DataService.signUp = async (name, email, phone, password, accountType, extraMeta = {}) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name,
          phone,
          account_type: accountType,
          referral_code: extraMeta.referralCode,
          avatar: extraMeta.avatar,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Não foi possível criar a conta.');

    const user = await profileForAuthUser(data.user);
    localStorage.setItem('nossosneg_session_user_id', user.id);
    return user;
  };

  DataService.signIn = async (email, password) => {
    const clean = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: clean,
      password,
    });

    if (error) throw new Error('E-mail ou palavra-passe incorretos.');
    if (!data.user) throw new Error('Não foi possível iniciar sessão.');

    const user = await profileForAuthUser(data.user);
    if (user.isSuspended) {
      await supabase.auth.signOut();
      throw new Error('A sua conta encontra-se suspensa.');
    }

    localStorage.setItem('nossosneg_session_user_id', user.id);
    return user;
  };

  DataService.signOut = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('nossosneg_session_user_id');
    if (error) throw error;
  };

  DataService.getCurrentSessionUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    try {
      return await profileForAuthUser(data.user);
    } catch {
      return null;
    }
  };

  DataService.resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(error.message);
  };

  DataService.updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  };

  DataService.updateEmail = async (email) => {
    const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    if (error) throw new Error(error.message);
  };

  // Keep the original methods reachable for rollback during development.
  void original;
}
