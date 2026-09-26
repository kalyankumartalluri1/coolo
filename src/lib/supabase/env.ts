const MOCK_PATTERNS = [/mock-coolo-dev/i, /dummy/i, /your-project-id/i, /your-anon-key/i, /your-service-role-key/i];

function isMockLike(value: string | undefined): boolean {
  if (!value) return true;
  return MOCK_PATTERNS.some((pattern) => pattern.test(value));
}

export function getSupabasePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || isMockLike(supabaseUrl)) {
    throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL. Set the real project URL in the environment.');
  }

  if (!supabaseAnonKey || isMockLike(supabaseAnonKey)) {
    throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Set the real anon key in the environment.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseEnv() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey || isMockLike(supabaseServiceRoleKey)) {
    throw new Error('Missing or invalid SUPABASE_SERVICE_ROLE_KEY. Set the real service role key in the environment.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

export function isSupabaseConfigured() {
  try {
    getSupabaseEnv();
    return true;
  } catch {
    return false;
  }
}
