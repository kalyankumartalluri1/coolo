import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isTechnicianRoute = pathname.startsWith('/technician');
  const isAccountRoute = pathname.startsWith('/account');

  if (!isAdminRoute && !isTechnicianRoute && !isAccountRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('coolo_session')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = JSON.parse(sessionCookie);
    const userRole = session.role;

    if (isAdminRoute && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'admin_access_required');
      return NextResponse.redirect(loginUrl);
    }

    if (
      isTechnicianRoute &&
      userRole !== 'TECHNICIAN' &&
      userRole !== 'ADMIN' &&
      userRole !== 'SUPER_ADMIN'
    ) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'technician_access_required');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy session parse error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/technician/:path*', '/account/:path*'],
};
