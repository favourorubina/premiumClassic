import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
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
}
