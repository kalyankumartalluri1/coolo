import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const requestedNext = request.nextUrl.searchParams.get('next');
  let next = '/portal';
  if (requestedNext) {
    try {
      const destination = new URL(requestedNext, request.url);
      if (destination.origin === request.nextUrl.origin && !requestedNext.includes('\\')) {
        next = `${destination.pathname}${destination.search}${destination.hash}`;
      }
    } catch {
      // Keep the default in-app destination for malformed redirects.
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL('/portal/login?error=confirmation', request.url));
}
