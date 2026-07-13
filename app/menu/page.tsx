import type { Metadata } from 'next';
import { Clock3, MessageCircle } from 'lucide-react';
import { DEFAULT_CURRENCY_SETTINGS } from '@/lib/currency-format';
import { getGroupedMenu } from '@/lib/menu';
import { getCurrencySettings } from '@/lib/site-settings-store';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse Premium Classic Pastries menu items, filter by category, build an order and send it to WhatsApp.',
  alternates: { canonical: '/menu' },
  openGraph: {
    title: 'Premium Classic Menu',
    description: 'Browse cake parfaits, banana breads, pancakes, pastries, shawarma and drinks from Premium Classic Pastries.',
    url: '/menu',
  },
};

const fallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

export default async function MenuPage() {
  const [groups, currencySettings] = await Promise.all([
    getGroupedMenu(),
    getCurrencySettings({ refreshIfStale: true }).catch(() => DEFAULT_CURRENCY_SETTINGS),
  ]);
  const items = Object.entries(groups).flatMap(([category, groupItems]) => groupItems.map(item => ({ ...item, category })));

  return (
    <div className="min-h-screen bg-[#f8f2e9] text-[#1c1712]">
      <section className="border-b border-[#3c2b1a1f] bg-[#201710] text-[#fffaf0]">
        <div className="mx-auto grid w-full max-w-[86rem] gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#dcae5d]">Premium Classic menu</p>
            <h1 className="font-display mt-2 text-4xl font-semibold leading-tight text-white sm:text-5xl">Find your next favourite</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#d9cbb5] sm:text-base">Search by name, and filter by category.</p>
          </div>
          <div className="flex max-w-md gap-3 border-l-2 border-[#dcae5d] pl-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#dcae5d]" />
            <p className="text-xs font-semibold leading-5 text-[#d9cbb5]">Please pre-order so availability, preparation time, pickup or delivery can be confirmed.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[86rem] px-4 py-7 pb-20 sm:px-6 sm:py-9 lg:px-8">
        {items.length ? (
          <MenuClient items={items} fallbackImage={fallbackImage} currencySettings={currencySettings} />
        ) : (
          <div className="rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] p-5 shadow-sm">
            <h2 className="text-base font-extrabold">The menu is being refreshed</h2>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-[#716255]">Send a WhatsApp message to ask what is available today.</p>
            <a href="https://wa.me/2348089464118" target="_blank" rel="noreferrer" className="pc-button-primary mt-4"><MessageCircle className="h-4 w-4" /> Ask on WhatsApp</a>
          </div>
        )}
      </section>
    </div>
  );
}
