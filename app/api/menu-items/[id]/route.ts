import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { name, category, imageUrl, description, prices } = body;

    if (!name || !category || !imageUrl || !prices || !Array.isArray(prices)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        category,
        imageUrl,
        description: description || null,
        pricesJson: prices,
      },
    });

    return NextResponse.json(item);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    console.error('PATCH /api/menu-items/[id] error', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    console.error('DELETE /api/menu-items/[id] error', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
