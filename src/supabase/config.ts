import { createClient } from '@supabase/supabase-js';

// Substitua estes valores pelas suas credenciais do Supabase
// Você pode encontrá-los no seu painel do Supabase em 'Settings' -> 'API'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);