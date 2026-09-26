import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database.types';

export interface PortalAccount {
  user: User;
  profile: {
    id: string;
    role: UserRole;
    full_name: string;
    email: string | null;
  };
}

export const getPortalAccount = cache(async (): Promise<PortalAccount | null> => {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) return null;
  return { user, profile };
});

export async function requirePortalAccount(roles?: UserRole[]) {
  const account = await getPortalAccount();
  if (!account) redirect('/portal/login');
  if (roles && !roles.includes(account.profile.role)) redirect('/portal');
  return account;
}
