// app/menu/page.tsx
import { getGroupedMenu } from "@/lib/menu";
import { toTitleCase } from "@/lib/text";

export default async function MenuPage() {
  const menuByCategory = await getGroupedMenu();
  const hasItems = Object.keys(menuByCategory).length > 0;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Full Menu
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            Cake parfaits, cake slices, banana breads, pancakes, pastries, shawarma and drinks.
            Everything you need to build a Premium Classic moment.
          </p>
        </header>

        {!hasItems && (
          <p className="mt-6 text-sm text-neutral-500">
            Menu is coming soon. Login to the admin area to add items.
          </p>
        )}

        {hasItems && (
          <div className="space-y-8">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <section key={category} className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                    {toTitleCase(category)}
                  </h2>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                    {items.length} option{items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(item => (
                    <article
                      key={item.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm"
                    >
                      <div className="h-32 w-full overflow-hidden bg-neutral-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900">
                            {toTitleCase(item.name)}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-xs leading-snug text-neutral-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1 text-[11px] font-medium text-neutral-800">
                          {item.pricesJson.map(price => (
                            <span
                              key={price.label}
                              className="rounded-full bg-amber-50 px-2 py-[3px] text-amber-900"
                            >
                              {price.label}: #{price.amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
