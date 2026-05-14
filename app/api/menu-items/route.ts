import { NextRequest, NextResponse } from 'next/server';
import { createMenuItem, getMenuItems, usingFirebaseMenuStore } from '@/lib/menu-store';

export async function GET() {
  try {
    const items = await getMenuItems();

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!usingFirebaseMenuStore()) {
      return NextResponse.json(
        { message: 'Firebase is not configured. Add credentials to .env.local first.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { name, category, imageUrl, description, prices } = body;

    if (!name || !category || !imageUrl || !prices || !Array.isArray(prices)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    const item = await createMenuItem({ name, category, imageUrl, description, prices });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('POST /api/menu-items error', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
