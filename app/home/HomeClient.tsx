// app/home/HomeClient.tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const fallbackImage =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80';

type MenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
};

interface HomeClientProps {
  items: {
    name: string;
    id: string;
    category: string;
    imageUrl: string;
    description: string | null;
    pricesJson: any;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

type Preview = { src: string; alt: string } | null;

function ImageViewModal({
  preview,
  onClose,
}: {
  preview: Preview;
  onClose: () => void;
}) {
  const open = !!preview;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, onClose]);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative z-10 w-[min(100%,56rem)] max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <p className="text-sm font-semibold text-neutral-900">Preview</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 overflow-auto bg-neutral-50">
          <div className="relative h-[min(70vh,34rem)] w-full">
            <Image
              src={preview.src}
              alt={preview.alt}
              fill
              className="object-contain"
              sizes="(max-width: 896px) 100vw, 56rem"
            />
          </div>
        </div>

        <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
          Press <span className="font-semibold text-neutral-900">Esc</span> to close
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-32 w-full overflow-hidden bg-neutral-100 sm:h-36"
      aria-label="Open image preview"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-800 opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100">
        View
      </div>
    </button>
  );
}

export default function HomeClient({ items }: HomeClientProps) {
  const [preview, setPreview] = useState<Preview>(null);

  const topCategories = (() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const item of items as any as MenuItem[]) {
      const key = (item.category || 'Others').trim() || 'Others';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return Object.entries(groups).slice(0, 3);
  })();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <ImageViewModal preview={preview} onClose={() => setPreview(null)} />

      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Premium Classic ✨
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Indulge in timeless flavors, freshly baked.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              From rich cake parfaits to fluffy pancakes, banana breads and loaded pastries,
              Premium Classic turns everyday moments into little celebrations.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/menu"
                className="inline-flex items-center rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                View full menu
              </a>

              <a
                href="https://wa.me/2348089464118"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-amber-600" />
                Order on WhatsApp
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600 sm:mt-5">
              <div>
                <p className="font-semibold text-neutral-900">Freshly made to order</p>
                <p className="mt-[2px]">
                  Small batches, premium ingredients and consistent quality in every box.
                </p>
              </div>

              <div className="hidden h-10 w-px bg-neutral-200 sm:block" />

              <div>
                <p className="font-semibold text-neutral-900">Perfect for gifting</p>
                <p className="mt-[2px]">
                  Birthdays, office surprises, gratitude boxes and dessert tables.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-300/10 to-transparent blur-2xl" />
            <div className="relative grid gap-3 rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-700">
                    Cake Parfaits
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    Chocolate • Lemon • Red Velvet
                  </p>
                  <p className="mt-[2px] text-[11px] text-neutral-600">
                    Layered goodness in every spoon.
                  </p>
                </div>
                <span className="rounded-full bg-amber-700 px-3 py-1 text-[11px] font-semibold text-white">
                  from #3,400
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                  <p className="font-semibold text-neutral-900">Banana Bread</p>
                  <p className="mt-[2px] text-[11px] text-neutral-600">
                    Classic, chocolate chunk, mini loaves and more.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                  <p className="font-semibold text-neutral-900">Pastries &amp; Shawarma</p>
                  <p className="mt-[2px] text-[11px] text-neutral-600">
                    Meat pies, sausage rolls, juicy shawarma and more.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-xs sm:grid-cols-[1.3fr,0.9fr] sm:items-center">
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3">
                  <p className="font-semibold text-neutral-900">Dessert gifts for every occasion</p>
                  <p className="mt-[2px] text-[11px] text-neutral-600">
                    Build a Premium box that says “you&apos;re special” without saying a word.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-[11px] text-neutral-600">
                  <p className="font-semibold text-neutral-900">How to order</p>
                  <ul className="mt-1 space-y-1">
                    <li>1. Browse the menu</li>
                    <li>2. Send your order on WhatsApp</li>
                    <li>3. Get confirmation and pickup or delivery info</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-neutral-200 pt-8 sm:mt-14 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                Explore the full menu
              </h2>
              <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                All items and prices are available on the Menu page.
              </p>
            </div>

            <a
              href="/menu"
              className="inline-flex items-center justify-center rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              View full menu
            </a>
          </div>

          {items.length === 0 && (
            <div className="mt-6 max-w-2xl rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
              <h3 className="text-base font-semibold text-neutral-900">Menu is updating</h3>
              <p className="mt-2">
                We’re currently refreshing the Menu page. You can still message us on WhatsApp to ask
                what’s available today.
              </p>
              <a
                href="https://wa.me/2348089464118"
                target="_blank"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white" />
                Chat with us on WhatsApp
              </a>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topCategories.map(([category, groupItems]) => {
                const first = groupItems[0];
                const image = first?.imageUrl || fallbackImage;
                const alt = first?.name || category;

                return (
                  <article
                    key={category}
                    className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                  >
                    <ImageCard
                      src={image}
                      alt={alt}
                      onOpen={() => setPreview({ src: image, alt })}
                    />

                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-neutral-900">{category}</h3>
                      <p className="mt-1 text-xs text-neutral-600">
                        {groupItems.slice(0, 3).map(i => i.name).join(' · ')}
                        {groupItems.length > 3 ? ' and more' : ''}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:mt-14 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                For birthdays, offices and special moments
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Whether you&apos;re stocking the fridge, surprising a loved one or setting up a
                dessert corner, Premium Classic has a treat combination that fits perfectly.
              </p>
            </div>
            <div className="space-y-2 text-xs text-neutral-600">
              <p>• Office snack trays and meeting treats</p>
              <p>• Dessert boxes for birthdays, anniversaries and date nights</p>
              <p>• Custom mix: parfaits, banana bread, pastries and shawarma in one order</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
