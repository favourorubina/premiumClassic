import { toTitleCase } from '@/lib/text';
import { getGroupedMenu } from '@/lib/menu';
import HomeImagePreview from './HomeImagePreview';

const fallbackImage =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80';

export default async function HomePage() {
  const menuByCategory: Record<string, Array<{ imageUrl: string; name: string }>> =
    await getGroupedMenu();
  const hasItems = Object.keys(menuByCategory).length > 0;

  return (
    <div className="min-h-screen bg-black text-amber-50">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Premium Classic ✨
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-amber-50 sm:text-4xl lg:text-5xl">
              Indulge in timeless flavors, freshly baked.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-amber-100/80 sm:text-base">
              From rich cake parfaits to fluffy pancakes, banana breads and loaded pastries,
              Premium Classic turns everyday moments into little celebrations.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/menu"
                className="inline-flex items-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black shadow-sm hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                View full menu
              </a>

              <a
                href="https://wa.me/2340000000000"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-black px-4 py-2 text-sm font-semibold text-amber-50 hover:border-amber-400/60 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                Order on WhatsApp
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-amber-100/70 sm:mt-5">
              <div>
                <p className="font-semibold text-amber-50">Freshly made to order</p>
                <p className="mt-[2px]">
                  Small batches, premium ingredients and consistent quality in every box.
                </p>
              </div>

              <div className="hidden h-10 w-px bg-amber-500/15 sm:block" />

              <div>
                <p className="font-semibold text-amber-50">Perfect for gifting</p>
                <p className="mt-[2px]">
                  Birthdays, office surprises, gratitude boxes and dessert tables.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/18 via-amber-300/10 to-transparent blur-2xl" />
            <div className="relative grid gap-3 rounded-3xl border border-amber-500/20 bg-neutral-950/60 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-500/15 bg-black/60 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-300">
                    Cake Parfaits
                  </p>
                  <p className="text-sm font-semibold text-amber-50">
                    Chocolate • Lemon • Red Velvet
                  </p>
                  <p className="mt-[2px] text-[11px] text-amber-100/70">
                    Layered goodness in every spoon.
                  </p>
                </div>
                <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-black">
                  from #3,400
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-500/15 bg-neutral-950/70 p-3">
                  <p className="font-semibold text-amber-50">Banana Bread</p>
                  <p className="mt-[2px] text-[11px] text-amber-100/65">
                    Classic, chocolate chunk, mini loaves and more.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/15 bg-neutral-950/70 p-3">
                  <p className="font-semibold text-amber-50">Pastries &amp; Shawarma</p>
                  <p className="mt-[2px] text-[11px] text-amber-100/65">
                    Meat pies, sausage rolls, juicy shawarma and more.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-xs sm:grid-cols-[1.3fr,0.9fr] sm:items-center">
                <div className="rounded-2xl border border-dashed border-amber-500/25 bg-black/50 px-4 py-3">
                  <p className="font-semibold text-amber-50">Dessert gifts for every occasion</p>
                  <p className="mt-[2px] text-[11px] text-amber-100/70">
                    Build a Premium box that says “you&apos;re special” without saying a word.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/15 bg-neutral-950/70 px-3 py-3 text-[11px] text-amber-100/75">
                  <p className="font-semibold text-amber-50">How to order</p>
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

        <section className="mt-12 border-t border-amber-500/15 pt-8 sm:mt-14 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-amber-50 sm:text-xl">
                Today&apos;s treats
              </h2>
              <p className="mt-1 text-xs text-amber-100/70 sm:text-sm">
                A peek into the menu. Tap &quot;View full menu&quot; to see everything.
              </p>
            </div>
          </div>

          {!hasItems && (
            <div className="mt-6 max-w-md rounded-2xl border border-amber-500/15 bg-neutral-950/60 p-4 text-sm text-amber-100/75 shadow-sm">
              <h3 className="text-base font-semibold text-amber-50">
                Our menu preview is being updated
              </h3>
              <p className="mt-2">
                We’re currently arranging our Premium Classic treats on the menu. You can still
                order your favourites directly on WhatsApp while this section is being refreshed.
              </p>
              <a
                href="https://wa.me/2340000000000"
                target="_blank"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-black/80" />
                Chat with us on WhatsApp
              </a>
            </div>
          )}

          {hasItems && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(menuByCategory)
                .slice(0, 3)
                .map(([category, items]) => {
                  const first = items[0];
                  const image = first.imageUrl || fallbackImage;

                  return (
                    <article
                      key={category}
                      className="group overflow-hidden rounded-2xl border border-amber-500/15 bg-neutral-950/60 shadow-sm transition hover:-translate-y-[2px] hover:border-amber-400/25 hover:shadow-md"
                    >
                      <HomeImagePreview src={image} alt={first.name} />

                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-amber-50">
                          {toTitleCase(category)}
                        </h3>
                        <p className="mt-1 text-xs text-amber-100/70">
                          {items
                            .slice(0, 3)
                            .map(i => toTitleCase(i.name))
                            .join(' · ')}
                          {items.length > 3 ? ' and more' : ''}
                        </p>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-3xl border border-amber-500/15 bg-neutral-950/60 p-5 shadow-sm sm:mt-14 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-amber-50 sm:text-xl">
                For birthdays, offices and special moments
              </h2>
              <p className="mt-2 text-sm text-amber-100/75">
                Whether you&apos;re stocking the fridge, surprising a loved one or setting up a
                dessert corner, Premium Classic has a treat combination that fits perfectly.
              </p>
            </div>
            <div className="space-y-2 text-xs text-amber-100/70">
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
