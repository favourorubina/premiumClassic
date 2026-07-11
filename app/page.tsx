import { DEFAULT_CURRENCY_SETTINGS } from '@/lib/currency-format';
import { getMenuItems } from '@/lib/menu-store';
import { getCurrencySettings } from '@/lib/site-settings-store';
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
  let currencySettings = DEFAULT_CURRENCY_SETTINGS;

  try {
    const [menuItems, settings] = await Promise.all([
      getMenuItems(),
      getCurrencySettings({ refreshIfStale: true }),
    ]);
    items = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      pricesJson: item.pricesJson,
    }));
    currencySettings = settings;
  } catch {
    items = [];
  }

  return <HomeClient items={items} currencySettings={currencySettings} />;
}
