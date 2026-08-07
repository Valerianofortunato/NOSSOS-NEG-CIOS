import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnhumavmdjyzfxbklqjh.supabase.co';
// Clean trailing rest/v1/ if present to get project root URL
if (rawUrl.endsWith('/rest/v1/')) {
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
} else if (rawUrl.endsWith('/rest/v1')) {
  rawUrl = rawUrl.replace(/\/rest\/v1$/, '');
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mUh8xL256IUQoYpMp9o8Aw_OpBS9LYm';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please ensure environment variables are configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: async (url, options) => {
      try {
        return await fetch(url, options);
      } catch (err: any) {
        console.warn("Supabase network unavailable, falling back to local storage:", err?.message || err);
        const isNetworkError = err && (
          err.name === 'TypeError' ||
          String(err).includes('Failed to fetch') ||
          String(err).includes('NetworkError')
        );
        if (isNetworkError) {
          return new Response(
            JSON.stringify({
              error: 'NETWORK_ERROR',
              message: 'Conexão de rede indisponível ou projeto Supabase offline.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        throw err;
      }
    }
  }
});

export default supabase;
