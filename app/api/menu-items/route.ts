import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error('GET /api/menu-items error', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, imageUrl, description, prices } = body;

    if (!name || !category || !imageUrl || !prices || !Array.isArray(prices)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        category,
        imageUrl,
        description: description || null,
        pricesJson: prices,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('POST /api/menu-items error', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
