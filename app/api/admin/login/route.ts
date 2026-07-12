import { NextRequest, NextResponse } from 'next/server';
import { getCredentialVersion, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || !(await verifyAdminPassword(password))) {
    return NextResponse.json(
      { ok: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  setAdminSession(res, await getCredentialVersion());

  return res;
}
