import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database.types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-coolo-dev.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
