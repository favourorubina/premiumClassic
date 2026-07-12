import { unstable_noStore as noStore } from 'next/cache';
import { getMenuItems } from '@/lib/menu-store';

export type PriceOption = { label: string; amount: number };
export type MenuItemWithPrices = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: PriceOption[];
};
export type GroupedMenu = Record<string, MenuItemWithPrices[]>;

export async function getGroupedMenu(): Promise<GroupedMenu> {
  noStore();

  try {
    const items = await getMenuItems();
    const groups: GroupedMenu = {};

    for (const item of items) {
      const key = item.category?.trim() || 'Others';
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        id: item.id,
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description ?? null,
        pricesJson: item.pricesJson,
      });
    }

    return groups;
  } catch {
    return {};
  }
}
