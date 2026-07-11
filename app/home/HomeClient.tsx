'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Gift, MessageCircle, Sparkles, Timer, Utensils } from 'lucide-react';
import { CurrencySettings, formatMoneyFromNaira } from '@/lib/currency-format';
import { toTitleCase } from '@/lib/text';

const fallbackImage =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80';

type PriceOption = {
  label: string;
  amount: number;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: PriceOption[];
};

interface HomeClientProps {
  items: MenuItem[];
  currencySettings: CurrencySettings;
}

function lowestPrice(item?: MenuItem) {
  const prices = item?.pricesJson || [];
  const amounts = prices.map(price => price.amount).filter(Boolean);
  if (amounts.length === 0) return null;
  return Math.min(...amounts);
}

export default function HomeClient({ items, currencySettings }: HomeClientProps) {
  const [heroIndex, setHeroIndex] = useState(0);

  function money(amount: number) {
    return formatMoneyFromNaira(amount, currencySettings);
  }

  const featuredItems = useMemo(() => {
    const withImages = items.filter(item => item.imageUrl);
    return (withImages.length ? withImages : items).slice(0, 6);
  }, [items]);

  const heroItems = featuredItems.length > 0 ? featuredItems.slice(0, 4) : [];
  const activeHero = heroItems[heroIndex % Math.max(heroItems.length, 1)];

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    items.forEach(item => {
      const key = item.category?.trim() || 'Others';
      groups.set(key, [...(groups.get(key) || []), item]);
    });
    return Array.from(groups.entries()).slice(0, 4);
  }, [items]);

  const heroSrc = activeHero?.imageUrl || fallbackImage;
  const heroName = activeHero?.name || 'Premium Classic treats';
  const heroPrice = lowestPrice(activeHero);

  return (
    <div className="min-h-screen bg-[#f6efe3] text-[#15100b]">
      <section className="mx-auto w-[calc(100vw-2rem)] max-w-[86rem] pb-9 pt-5 sm:w-[calc(100vw-3rem)] sm:pb-10 sm:pt-7 lg:w-[calc(100vw-4rem)] lg:pt-9">
        <div className="grid min-w-0 grid-cols-1 overflow-hidden rounded-[2rem] border border-[#2c211733] bg-[#17110b] shadow-[0_26px_80px_rgba(32,20,10,0.18)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="min-w-0 p-6 text-[#fff8eb] sm:p-8 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-center lg:p-10 xl:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#e4b969]">
            Premium Classic Pastries
          </p>
          <h1 className="font-display mt-4 max-w-3xl break-words text-3xl font-semibold leading-[1.08] text-white sm:mt-5 sm:text-5xl xl:text-[4rem]">
            Fresh desserts, savoury bites and gift boxes made to order.
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#e7d6ba] sm:text-lg sm:leading-8">
            Choose from cake parfaits, banana breads, pancakes, pastries, shawarma and drinks.
            Build your order in minutes and send it straight to WhatsApp.
          </p>

          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/menu"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e4b969] px-5 text-sm font-extrabold text-[#120d08] hover:bg-[#f2c977] sm:w-auto"
            >
              <Utensils className="h-4 w-4" />
              Browse menu
            </Link>
            <a
              href="https://wa.me/2348089464118"
              target="_blank"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-5 text-sm font-extrabold text-[#fff8eb] hover:bg-white/15 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Order on WhatsApp
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Pre-order fresh', 'Prepared after confirmation.'],
              ['Gift ready', 'Boxes for birthdays and office treats.'],
              ['Sweet plus savoury', 'Desserts, drinks and shawarma together.'],
            ].map(([title, text]) => (
              <div key={title} className="border-l border-[#e4b96966] pl-4">
                <p className="text-sm font-extrabold text-white">{title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#d8c7ab]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0 border-t border-white/10 bg-[#21170e] p-4 sm:p-5 lg:flex lg:min-h-[34rem] lg:flex-col lg:border-l lg:border-t-0 lg:p-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 lg:flex-1">
            <div className="relative min-h-[17rem] sm:min-h-[23rem] lg:h-full lg:min-h-[28rem]">
              <Image
                src={heroSrc}
                alt={heroName}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 44vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#f2c977]">
                  Today from the menu
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {toTitleCase(heroName)}
                </h2>
                {heroPrice && (
                  <p className="mt-2 text-sm font-bold text-[#ffe5b1]">from {money(heroPrice)}</p>
                )}
              </div>
            </div>
          </div>

          {heroItems.length > 1 && (
            <div className="mt-3 hidden grid-cols-4 gap-2 sm:grid">
              {heroItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className={
                    index === heroIndex
                      ? 'relative aspect-square overflow-hidden rounded-xl border-2 border-[#e4b969]'
                      : 'relative aspect-square overflow-hidden rounded-xl border border-white/10 opacity-75 hover:opacity-100'
                  }
                  aria-label={`Show ${item.name}`}
                >
                  <Image src={item.imageUrl || fallbackImage} alt={item.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </section>

      <section className="border-y border-[#3c2b1a1a] bg-[#130f0b] py-8 text-[#fff8eb]">
        <div className="pc-container grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Signature parfaits', text: 'Chocolate, lemon, vanilla, milky and red velvet layers.' },
            { icon: Gift, title: 'Custom treat boxes', text: 'Mix dessert cups, banana bread, pastries and drinks.' },
            { icon: Timer, title: 'Order ahead', text: 'Pre-order timing keeps every batch fresh and intentional.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e4b969] text-[#130f0b]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#d8c7ab]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pc-container py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pc-eyebrow">Explore the menu</p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#1b1713]">
              Choose by craving.
            </h2>
          </div>
          <Link href="/menu" className="pc-button-secondary">
            View all items
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="pc-card mt-8 rounded-3xl p-6">
            <h3 className="text-lg font-extrabold text-[#1b1713]">Menu is updating</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6358]">
              The menu is being refreshed. Message Premium Classic on WhatsApp to ask what is
              available today.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryGroups.map(([category, group]) => {
              const first = group[0];
              return (
                <Link
                  key={category}
                  href="/menu"
                  className="group overflow-hidden rounded-3xl border border-[#3c2b1a1a] bg-white/75 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={first?.imageUrl || fallbackImage}
                      alt={first?.name || category}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#98620f]">
                      {group.length} item{group.length > 1 ? 's' : ''}
                    </p>
                    <h3 className="font-display mt-1 text-2xl font-semibold text-[#1b1713]">
                      {toTitleCase(category)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6358]">
                      {group.slice(0, 3).map(item => toTitleCase(item.name)).join(', ')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="pc-container pb-14">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-[2rem] bg-[#130f0b] p-6 text-[#fff8eb] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e4b969]">
              How ordering works
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold">Browse. Build. Send.</h2>
            <div className="mt-6 grid gap-4">
              {[
                ['1', 'Browse the live menu and add your preferred sizes or portions.'],
                ['2', 'Review your order with your name and Nigerian phone number.'],
                ['3', 'Send the full summary to Premium Classic on WhatsApp.'],
              ].map(([step, text]) => (
                <div key={step} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e4b969] text-sm font-extrabold text-[#130f0b]">
                    {step}
                  </span>
                  <p className="text-sm leading-6 text-[#e9dcc5]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Birthdays', 'Parfait cups, banana bread, pancakes and dessert boxes for intimate celebrations.'],
              ['Office treats', 'Snack trays, pastries, drinks and sweet bites for meetings or team surprises.'],
              ['Weekend cravings', 'A soft landing for stay-home evenings, movie nights and solo treats.'],
              ['Thank-you gifts', 'Premium combinations that feel personal without needing a big speech.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-[#3c2b1a1a] bg-white/75 p-5">
                <h3 className="text-lg font-extrabold text-[#1b1713]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f6358]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
