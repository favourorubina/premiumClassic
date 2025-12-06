import { toTitleCase } from "@/lib/text";
import { getGroupedMenu } from "@/lib/menu";

export default async function HomePage() {
  const menuByCategory: Record<string, Array<{ imageUrl: string; name: string }>> = await getGroupedMenu();
  const hasItems = Object.keys(menuByCategory).length > 0;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Premium Classic ✨
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Indulge in timeless flavors.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              From rich cake parfaits to fluffy pancakes and fully loaded pastries, Premium
              Classic brings dessert moments that feel like a treat and a hug in one bite.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/menu"
                className="inline-flex items-center rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-800"
              >
                View full menu
              </a>
              <p className="text-xs text-neutral-500">
                Signature Cookie Box · Premium Cake &amp; Pastry Box · Dessert gifts 🎁
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-200/10 to-white/40 blur-2xl" />
            <div className="relative grid gap-3 rounded-3xl border border-amber-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-800">
                    Cake Parfaits
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    Chocolate • Lemon • Red Velvet
                  </p>
                </div>
                <span className="rounded-full bg-amber-700 px-3 py-1 text-[11px] font-semibold text-white">
                  from #3,400
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
                  <p className="font-semibold text-neutral-900">Banana Bread</p>
                  <p className="mt-[2px] text-[11px] text-neutral-500">
                    Chocolate Chunk · No Sugar · Mini sets
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
                  <p className="font-semibold text-neutral-900">Pastries &amp; Shawarma</p>
                  <p className="mt-[2px] text-[11px] text-neutral-500">
                    Meat pie, sausage rolls, juicy shawarma &amp; more.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-3 text-xs">
                <div>
                  <p className="font-semibold text-neutral-900">Dessert gifts for every occasion</p>
                  <p className="text-[11px] text-neutral-600">
                    Build a Premium box that says “you&apos;re special”.
                  </p>
                </div>
                <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-medium text-amber-800">
                  Made freshly to order
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-neutral-200 pt-8 sm:mt-14 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                Today&apos;s treats
              </h2>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                A peek into the menu. Tap &quot;View full menu&quot; to see everything.
              </p>
            </div>
          </div>

          {!hasItems && (
            <p className="mt-6 text-sm text-neutral-500">
              Menu is coming soon. Login to the admin area to add your first Premium Classic
              treats.
            </p>
          )}

          {hasItems && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(menuByCategory)
                .slice(0, 3)
                .map(([category, items]) => {
                  const first = items[0];
                  return (
                    <article
                      key={category}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm"
                    >
                      <div className="h-32 w-full overflow-hidden bg-neutral-100">
                        <img
                          src={first.imageUrl}
                          alt={first.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {toTitleCase(category)}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-600">
                          {items.slice(0, 3).map(i => toTitleCase(i.name)).join(" · ")}
                          {items.length > 3 ? " +" : ""}
                        </p>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
