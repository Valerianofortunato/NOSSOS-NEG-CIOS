import { createClient } from '@supabase/supabase-js';

/**
 * Single Supabase client used by the whole application.
 *
 * The application must receive these values from Vite environment variables.
 * We intentionally do not silently fall back to a hard-coded project/key: a
 * missing configuration should fail fast instead of creating confusing local
 * or network-fallback behaviour.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuração do Supabase em falta. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.'
  );
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co(?:\/)?$/i.test(supabaseUrl)) {
  throw new Error(
    'VITE_SUPABASE_URL inválida. Use a URL raiz do projeto Supabase, por exemplo https://seu-projeto.supabase.co.'
  );
}

export const supabase = createClient(supabaseUrl.replace(/\/$/, ''), supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'nossos-negocios'
    }
  }
});

export default supabase;
