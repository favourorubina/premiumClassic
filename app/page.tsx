import { getMenuItems } from '@/lib/menu-store';
import HomeClient from './home/HomeClient';

type HomeMenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: {
    label: string;
    amount: number;
  }[];
};

export default async function Page() {
  let items: HomeMenuItem[] = [];

  try {
    const menuItems = await getMenuItems();
    items = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      pricesJson: item.pricesJson,
    }));
  } catch {
    items = [];
  }

  return <HomeClient items={items} />;
}
