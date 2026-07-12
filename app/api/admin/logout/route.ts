import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  clearAdminSession(res);

  return res;
}
