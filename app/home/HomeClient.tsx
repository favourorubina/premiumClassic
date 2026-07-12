'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Gift, MessageCircle, ShoppingBag, Sparkles, Timer } from 'lucide-react';
import type { CurrencySettings } from '@/lib/currency-format';
import { toTitleCase } from '@/lib/text';

const fallbackImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=85';

type MenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: { label: string; amount: number }[];
};

export default function HomeClient({ items }: { items: MenuItem[]; currencySettings: CurrencySettings }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const featuredItems = useMemo(() => (items.filter(item => item.imageUrl).length ? items.filter(item => item.imageUrl) : items).slice(0, 6), [items]);
  const heroItems = featuredItems.slice(0, 4);
  const activeHero = heroItems[heroIndex % Math.max(heroItems.length, 1)];

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    items.forEach(item => {
      const category = item.category?.trim() || 'Others';
      groups.set(category, [...(groups.get(category) || []), item]);
    });
    return Array.from(groups.entries()).slice(0, 4);
  }, [items]);

  return (
    <div className="bg-[#f8f2e9]">
      <section className="relative isolate min-h-[31rem] max-h-[42rem] h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#241a12]">
        <Image
          src={activeHero?.imageUrl || fallbackImage}
          alt={activeHero?.name || 'Premium Classic pastries and desserts'}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,8,0.9)_0%,rgba(18,12,8,0.69)_48%,rgba(18,12,8,0.16)_100%)] max-md:bg-[linear-gradient(180deg,rgba(18,12,8,0.32)_0%,rgba(18,12,8,0.9)_100%)]" />
        <div className="relative mx-auto flex h-full w-full max-w-[86rem] flex-col justify-end px-4 pb-8 pt-10 sm:px-6 sm:pb-10 lg:justify-center lg:px-8">
          <div className="max-w-2xl text-[#fffaf1]">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#efc979]">Premium Classic Pastries</p>
            <h1 className="font-display mt-3 max-w-xl text-[2.35rem] font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[3.35rem]">
              Fresh treats made for sharing, gifting and savouring.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-[#eadbc4] sm:text-base sm:leading-7">
              Pick from parfaits, banana breads, pancakes, pastries, shawarma and drinks, then send your complete order on WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/menu" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#dcae5d] px-4 text-sm font-extrabold text-[#15100c] hover:bg-[#efc979]">
                <ShoppingBag className="h-4 w-4" /> Browse menu
              </Link>
              <a href="https://wa.me/2348089464118" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/25 bg-black/20 px-4 text-sm font-extrabold text-white backdrop-blur-sm hover:bg-white/10">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          {heroItems.length > 1 && (
            <div className="mt-7 flex gap-2" aria-label="Featured menu items">
              {heroItems.map((item, index) => (
                <button key={item.id} type="button" onClick={() => setHeroIndex(index)} className={`relative h-12 w-16 overflow-hidden rounded-md border-2 transition sm:h-14 sm:w-20 ${index === heroIndex ? 'border-[#efc979]' : 'border-white/30 opacity-75 hover:opacity-100'}`} aria-label={`Show ${item.name}`}>
                  <Image src={item.imageUrl || fallbackImage} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
              {activeHero && (
                <div className="ml-1 hidden min-w-0 self-center sm:block">
                  <p className="truncate text-xs font-extrabold text-white">{toTitleCase(activeHero.name)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-[#3c2b1a1f] bg-[#fffdf8]">
        <div className="pc-container grid divide-y divide-[#3c2b1a1a] py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            [Timer, 'Prepared fresh', 'Made after your order is confirmed.'],
            [Gift, 'Gift-ready choices', 'Thoughtful treats for people and teams.'],
            [Sparkles, 'Sweet and savoury', 'Build one order across the full menu.'],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Timer;
            return (
              <div key={String(title)} className="flex items-center gap-3 px-2 py-4 sm:px-5">
                <FeatureIcon className="h-5 w-5 shrink-0 text-[#a46c18]" />
                <div><h2 className="text-sm font-extrabold text-[#1c1712]">{String(title)}</h2><p className="mt-0.5 text-xs font-semibold leading-5 text-[#716255]">{String(text)}</p></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pc-container py-12 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div><p className="pc-eyebrow">Explore the menu</p><h2 className="font-display mt-2 text-3xl font-semibold text-[#1c1712] sm:text-4xl">Choose by craving</h2></div>
          <Link href="/menu" className="hidden min-h-10 items-center gap-2 rounded-md border border-[#3c2b1a33] bg-white px-3.5 text-sm font-extrabold sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {categoryGroups.length ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryGroups.map(([category, group]) => {
              const first = group[0];
              return (
                <Link key={category} href="/menu" className="group overflow-hidden rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e7dac8]">
                    <Image src={first?.imageUrl || fallbackImage} alt={first?.name || category} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 50vw, 25vw" />
                  </div>
                  <div className="p-4">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#98620f]">{group.length} choice{group.length === 1 ? '' : 's'}</p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#1c1712]">{toTitleCase(category)}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5 text-[#716255]">{group.slice(0, 3).map(item => toTitleCase(item.name)).join(', ')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] p-5 text-sm font-semibold text-[#716255]">The menu is being refreshed. Message us on WhatsApp for today&apos;s availability.</div>
        )}
        <Link href="/menu" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#3c2b1a33] bg-white px-3.5 text-sm font-extrabold sm:hidden">View all menu items <ArrowRight className="h-4 w-4" /></Link>
      </section>

      <section className="border-y border-[#3c2b1a1f] bg-[#fffdf8] py-12">
        <div className="pc-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="pc-eyebrow">Simple ordering</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-[#1c1712] sm:text-4xl">From menu to WhatsApp in three steps</h2>
            <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-[#716255]">Build the order at your pace. We send a clear summary so confirmation is quick and accurate.</p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Browse', 'Search the menu and choose a size or portion.'],
              ['02', 'Review', 'Check quantities, your name and phone number.'],
              ['03', 'Send', 'Open WhatsApp with the full order already written.'],
            ].map(([number, title, text]) => (
              <li key={number} className="border-l-2 border-[#dcae5d] py-1 pl-4"><span className="text-xs font-extrabold text-[#98620f]">{number}</span><h3 className="mt-1 text-base font-extrabold">{title}</h3><p className="mt-1 text-xs font-semibold leading-5 text-[#716255]">{text}</p></li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
