import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PREFIX = '/bima/admin';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAdminSession = Boolean(req.cookies.get('pc_admin')?.value);

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    const isLoginPage = pathname.startsWith(`${ADMIN_PREFIX}/login`);
    if (!hasAdminSession && !isLoginPage) {
      const loginUrl = new URL(`${ADMIN_PREFIX}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/bima/admin',
    '/bima/admin/:path*',
  ],
};
