import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

// Export a function to create a new client instance (for API routes)
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
