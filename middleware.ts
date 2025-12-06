import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PREFIX = '/sweet-81985';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = req.cookies.get('pc_admin')?.value === '1';

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    const isLoginPage = pathname.startsWith(`${ADMIN_PREFIX}/login`);
    if (!isAdmin && !isLoginPage) {
      const loginUrl = new URL(`${ADMIN_PREFIX}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdmin && isLoginPage) {
      const dashboardUrl = new URL(ADMIN_PREFIX, req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (
    pathname.startsWith('/api/menu-items') ||
    pathname.startsWith('/api/admin/upload')
  ) {
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sweet-81985', '/sweet-81985/:path*', '/api/menu-items/:path*', '/api/admin/:path*'],
};
