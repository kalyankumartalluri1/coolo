import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database.types';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
