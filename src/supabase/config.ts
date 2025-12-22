import { createClient } from '@supabase/supabase-js';

// Substitua estes valores pelas suas credenciais do Supabase
// Você pode encontrá-los no seu painel do Supabase em 'Settings' -> 'API'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Validate the Supabase URL
let supabase;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('Invalid Supabase URL. Please configure your Supabase credentials.');

  // Mock client to prevent crashes
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      updateUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => () => {},
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: new Error('Supabase not configured') }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      delete: () => ({ eq: () => ({ error: new Error('Supabase not configured') }) }),
    }),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };