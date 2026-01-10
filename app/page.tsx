import { prisma } from '@/lib/prisma';
import HomeClient from './home/HomeClient';

export default async function Page() {
  let items: any[] = [];

  try {
    items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
        description: true,
        pricesJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (e) {
    items = [];
  }

  return <HomeClient items={items} />;
}
