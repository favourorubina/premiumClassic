import { getGroupedMenu } from '@/lib/menu';
import { toTitleCase } from '@/lib/text';

const fallbackImage =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

export default async function MenuPage() {
  const groups = await getGroupedMenu();
  const hasItems = Object.keys(groups).length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Premium Classic Menu
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Explore all our treats.
          </h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base">
            Browse through the full selection of cake parfaits, pastries, banana breads,
            shawarma and dessert boxes. We update this page as new treats are added.
          </p>
        </section>

        {!hasItems && (
          <div className="mt-8 max-w-3xl rounded-2xl bg-white/90 p-5 text-sm text-neutral-600 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">
              Our menu is being refreshed
            </h2>
            <p className="mt-2">
              We&apos;re currently updating the Premium Classic menu. Please check back in a
              little while, or send us a message on WhatsApp to ask about today&apos;s available
              treats.
            </p>
            <a
              href="https://wa.me/2340000000000"
              target="_blank"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-400"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white" />
              Chat with us on WhatsApp
            </a>
          </div>
        )}

        {hasItems && (
          <div className="mt-8 space-y-8 sm:mt-10">
            {Object.entries(groups).map(([category, items]) => (
              <section key={category} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                    {toTitleCase(category)}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(item => {
                    const image = item.imageUrl || fallbackImage;
                    const hasPrices = item.pricesJson && item.pricesJson.length > 0;
                    return (
                      <article
                        key={item.id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm"
                      >
                        <div className="h-32 w-full overflow-hidden bg-neutral-100 sm:h-36">
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                          <h3 className="text-sm font-semibold text-neutral-900">
                            {toTitleCase(item.name)}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-xs text-neutral-600">
                              {item.description}
                            </p>
                          )}
                          {hasPrices && (
                            <p className="mt-2 text-xs font-medium text-neutral-800">
                              {item.pricesJson
                                .map(p => `${p.label}: ₦${p.amount}`)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
