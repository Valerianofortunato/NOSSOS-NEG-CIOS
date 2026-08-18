import {
  User,
  Product,
  Category,
  SystemStats,
  AdCampaign,
  VerificationSubmission,
  UserRating,
  Report,
  Conversation,
  ChatMessage,
  ChatNotification,
  CommissionNegotiation,
  Transaction,
  ProductComment,
  JobCandidacy
} from '../types';
import { PaymentOrder } from './PaymentService';
import { supabase } from '../lib/supabase';

/**
 * DataService
 *
 * Supabase is the source of truth. Authentication MUST use Supabase Auth.
 * There is intentionally no localStorage/mock fallback for authentication.
 */

function camelToSnakeUser(user: Partial<User>): any {
  return {
    id: user.id,
    name: user.name,
    email: user.email?.toLowerCase().trim(),
    phone: user.phone,
    account_type: user.accountType,
    referral_code: user.referralCode,
    referrals_count: user.referralsCount || 0,
    is_verified: user.isVerified || false,
    is_suspended: user.isSuspended || false,
    is_admin: user.isAdmin || false,
    avatar: user.avatar,
    rating: user.rating || 5,
    ratings_count: user.ratingsCount || 0,
    wallet_balance: user.walletBalance || 0,
    created_at: user.createdAt || new Date().toISOString()
  };
}

function snakeToCamelUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    accountType: user.account_type || 'cliente',
    referralCode: user.referral_code,
    referralsCount: user.referrals_count || 0,
    isVerified: !!user.is_verified,
    isSuspended: !!user.is_suspended,
    isAdmin: !!user.is_admin,
    avatar: user.avatar || '',
    rating: Number(user.rating) || 5,
    ratingsCount: Number(user.ratings_count) || 0,
    walletBalance: Number(user.wallet_balance) || 0,
    createdAt: user.created_at || new Date().toISOString()
  };
}

function camelToSnakeProduct(p: any): any {
  return {
    id: p.id,
    seller_id: p.sellerId,
    seller_name: p.sellerName,
    seller_type: p.sellerType || 'cliente',
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images || [],
    likes: p.likes || 0,
    liked_by: p.likedBy || [],
    comments: p.comments || [],
    condition: p.condition || 'usado',
    is_promoted: p.isPromoted || false,
    views: p.views || 0,
    clicks: p.clicks || 0,
    messages_count: p.messagesCount || 0,
    commission_rate: p.commissionRate || 0,
    created_at: p.createdAt || new Date().toISOString()
  };
}

function snakeToCamelProduct(p: any): Product {
  return {
    id: p.id,
    sellerId: p.seller_id,
    sellerName: p.seller_name,
    sellerType: p.seller_type || 'cliente',
    title: p.title,
    description: p.description,
    price: Number(p.price) || 0,
    category: p.category,
    images: p.images || [],
    likes: Number(p.likes) || 0,
    likedBy: p.liked_by || [],
    comments: p.comments || [],
    condition: p.condition || 'usado',
    isPromoted: !!p.is_promoted,
    views: Number(p.views) || 0,
    clicks: Number(p.clicks) || 0,
    messagesCount: Number(p.messages_count) || 0,
    commissionRate: p.commission_rate ? Number(p.commission_rate) : undefined,
    createdAt: p.created_at || new Date().toISOString()
  };
}

export class DataService {
  public static async uploadFile(
    bucket: 'avatars' | 'products' | 'companies' | 'documents' | 'banners',
    fileName: string,
    fileData: string | Blob
  ): Promise<string> {
    if (typeof fileData === 'string' && fileData.startsWith('http')) return fileData;

    let blob: Blob;
    if (typeof fileData === 'string') {
      if (!fileData.startsWith('data:')) throw new Error('Ficheiro inválido.');
      const [header, base64] = fileData.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      blob = new Blob([bytes], { type: mime });
    } else {
      blob = fileData;
    }

    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(cleanName, blob, { upsert: false });
    if (error) throw new Error(`Falha no upload: ${error.message}`);

    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
  }

  // ---------------- AUTH: SUPABASE AUTH ONLY ----------------
  public static async signUp(
    name: string,
    email: string,
    phone: string,
    password: string,
    accountType: string,
    extraMeta: any = {}
  ): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name, phone, account_type: accountType, ...extraMeta }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Não foi possível criar a conta.');

    const userId = data.user.id;
    const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const profile = {
      ...camelToSnakeUser({
        id: userId,
        name,
        email: cleanEmail,
        phone,
        accountType: accountType as any,
        referralCode,
        isVerified: false,
        isSuspended: false,
        isAdmin: false,
        avatar: extraMeta.avatar || '',
        rating: 5,
        ratingsCount: 0,
        walletBalance: 0
      }),
      id: userId
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select('*')
      .single();

    if (profileError) throw new Error(`Conta criada, mas não foi possível criar o perfil: ${profileError.message}`);
    return snakeToCamelUser(profileData);
  }

  public static async signIn(email: string, password: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Não foi possível iniciar sessão.');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Perfil do utilizador não encontrado.');
    }

    if (profile.is_suspended) {
      await supabase.auth.signOut();
      throw new Error('A sua conta encontra-se suspensa.');
    }

    return snakeToCamelUser(profile);
  }

  public static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Erro ao terminar sessão: ${error.message}`);
  }

  public static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
    if (error) throw new Error(error.message);
  }

  public static async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }

  public static async updateEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ email: email.toLowerCase().trim() });
    if (error) throw new Error(error.message);
  }

  public static async getCurrentSessionUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !data) return null;
    return snakeToCamelUser(data);
  }

  public static async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) throw new Error(`Perfil não encontrado: ${error?.message || userId}`);
    return snakeToCamelUser(data);
  }

  public static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.isSuspended !== undefined) dbUpdates.is_suspended = updates.isSuspended;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.ratingsCount !== undefined) dbUpdates.ratings_count = updates.ratingsCount;
    if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;

    const { data, error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId).select('*').single();
    if (error || !data) throw new Error(`Não foi possível atualizar o perfil: ${error?.message}`);
    return snakeToCamelUser(data);
  }
}

export default DataService;
