import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: { id: string };
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const body = await req.json();
  const { name, category, imageUrl, description, prices } = body;

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
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = params;

  await prisma.menuItem.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
