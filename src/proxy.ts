import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/types/database.types';

// Session-refresh proxy (Next.js 16 replacement for middleware).
// Supabase SSR issues short-lived access tokens; this keeps them rotated on
// every matching request so server components always see a live session
// instead of a stale/expired cookie. Cookie writes are allowed here because
// the proxy runs before rendering (unlike server components, where writes
// are silently skipped).

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() triggers a token refresh when the access token is expired and
  // persists the new cookies onto the outgoing response.
  try {
    await supabase.auth.getUser();
  } catch {
    // Network/Supabase hiccups must never block page rendering.
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all app pages and API routes except static assets.
     * - Excludes _next/static, _next/image, and public files (favicon etc.)
     * - Includes app routes so server components read fresh session cookies
     * - Includes API routes (bookings/contact) so they attribute the booking
     *   to the signed-in user with a valid, rotated token
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
