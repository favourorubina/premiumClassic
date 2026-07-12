import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authenticated = await isAdminRequest(request);
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}
