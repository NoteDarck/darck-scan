import { createClient } from '@supabase/supabase-js';

// Substitua estes valores pelas suas credenciais do Supabase
// Você pode encontrá-los no seu painel do Supabase em 'Settings' -> 'API'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);