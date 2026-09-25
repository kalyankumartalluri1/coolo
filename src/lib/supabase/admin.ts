import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';
import { getSupabaseEnv } from '@/lib/supabase/env';

// WARNING: Server-only! Never import into client components.
export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
