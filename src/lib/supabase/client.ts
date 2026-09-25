import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database.types';
import { getSupabaseEnv } from '@/lib/supabase/env';

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
