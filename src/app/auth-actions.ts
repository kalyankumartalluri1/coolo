'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Signs the current user out of Supabase Auth and lands them on the login
 * screen. Used by the portal dashboard and by the signed-in state of the
 * public site header/mobile navigation so the session is consistent
 * everywhere.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/portal/login');
}
