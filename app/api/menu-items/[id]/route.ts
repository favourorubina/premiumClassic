import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, imageUrl, description, prices } = body;

    if (!name || !category || !imageUrl || !Array.isArray(prices)) {
      return NextResponse.json(
        { message: 'Invalid data' },
        { status: 400 },
      );
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
  } catch (error) {
    console.error('PATCH /api/menu-items/[id] error', error);
    return NextResponse.json(
      { message: 'Failed to update menu item' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/menu-items/[id] error', error);
    return NextResponse.json(
      { message: 'Failed to delete menu item' },
      { status: 500 },
    );
  }
}
