import { NextRequest, NextResponse } from 'next/server';
import { changeAdminPassword, isAdminRequest, setAdminSession } from '@/lib/admin-auth';

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ message: 'Your admin session has expired.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const version = await changeAdminPassword(currentPassword, newPassword);
    const response = NextResponse.json({ ok: true });
    setAdminSession(response, version);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not change the password.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
