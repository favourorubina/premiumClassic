import seedItems from '@/data/menu-items.json';

export type PriceOption = { label: string; amount: number };

export type MenuItemRecord = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: PriceOption[];
  createdAt: Date;
  updatedAt: Date;
};

type RawMenuItem = {
  id?: string;
  name?: string;
  category?: string;
  imageUrl?: string;
  description?: string | null;
  pricesJson?: PriceOption[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

function cleanText(value: string) {
  return value
    .replaceAll('â€”', '-')
    .replaceAll('â€“', '-')
    .replaceAll('â€¢', '-')
    .replaceAll('ðŸ˜‹', '')
    .replaceAll('  ', ' ')
    .trim();
}

function toDate(value: string | Date | undefined) {
  if (value instanceof Date) return value;
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function normalizeMenuItem(item: RawMenuItem): MenuItemRecord {
  return {
    id: item.id || crypto.randomUUID(),
    name: cleanText(item.name || 'Untitled item'),
    category: cleanText(item.category || 'Others'),
    imageUrl: item.imageUrl || '',
    description: item.description ? cleanText(item.description) : null,
    pricesJson: Array.isArray(item.pricesJson)
      ? item.pricesJson.map(price => ({
          label: cleanText(price.label || 'Price'),
          amount: Number(price.amount) || 0,
        }))
      : [],
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
  };
}

export const seedMenuItems: MenuItemRecord[] = (seedItems as RawMenuItem[])
  .map(normalizeMenuItem)
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
