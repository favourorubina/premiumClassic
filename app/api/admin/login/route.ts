import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set('pc_admin', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 4,
  });

  return res;
}
