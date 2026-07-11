import { MessageCircle, ShoppingBag } from 'lucide-react';
import { DEFAULT_CURRENCY_SETTINGS } from '@/lib/currency-format';
import { getGroupedMenu } from '@/lib/menu';
import { getCurrencySettings } from '@/lib/site-settings-store';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

const fallbackImage =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

export default async function MenuPage() {
  const [groups, currencySettings] = await Promise.all([
    getGroupedMenu(),
    getCurrencySettings({ refreshIfStale: true }).catch(() => DEFAULT_CURRENCY_SETTINGS),
  ]);
  const hasItems = Object.keys(groups).length > 0;

  const flatItems = Object.entries(groups).flatMap(([category, items]) =>
    items.map(item => ({
      ...item,
      category,
    })),
  );

  return (
    <div className="min-h-screen bg-[#f6efe3] text-[#15100b]">
      <section className="mx-auto w-full max-w-[86rem] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#2c211733] bg-[#17110b] shadow-[0_26px_80px_rgba(32,20,10,0.18)] lg:grid-cols-[1fr_0.72fr]">
          <div className="p-6 text-[#fff8eb] sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#e4b969]">
              Premium Classic Menu
            </p>
            <h1 className="font-display mt-3 max-w-4xl text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
              Pick treats like an order board.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#e7d6ba]">
              Search, filter, add quantities and send the full summary straight to WhatsApp.
              Fresh batches, clear prices, no confusion.
            </p>
          </div>
          </div>

          <div className="border-t border-white/10 bg-[#21170e] p-6 text-[#fff8eb] lg:border-l lg:border-t-0">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e4b969] text-[#130f0b]">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-extrabold">Pre-order note</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-[#d8c7ab]">
                  Please place orders ahead of time so Premium Classic can confirm availability,
                  timing, pickup or delivery details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!hasItems && (
          <div className="mt-8 rounded-3xl border border-[#2c211733] bg-white p-6 shadow-lg">
            <h2 className="text-lg font-extrabold text-[#1b1713]">The menu is being refreshed</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6358]">
              Send a WhatsApp message to ask what is available today while the online menu is
              being updated.
            </p>
            <a href="https://wa.me/2348089464118" target="_blank" className="pc-button-primary mt-4">
              <MessageCircle className="h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>
        )}

        {hasItems && (
          <MenuClient
            items={flatItems}
            fallbackImage={fallbackImage}
            currencySettings={currencySettings}
          />
        )}
      </section>
    </div>
  );
}
