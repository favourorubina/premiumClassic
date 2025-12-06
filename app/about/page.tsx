import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            About Premium Classic
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Dessert moments, made soft and memorable.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Premium Classic is a small dessert studio with a big heart for comfort food. We
            specialise in cake parfaits, fluffy pancakes, banana breads, pastries, shawarma
            and dessert boxes that turn everyday moments into little celebrations.
          </p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <div className="space-y-5 text-sm leading-relaxed text-neutral-700 sm:text-[0.93rem]">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                Our story
              </h2>
              <p className="mt-2">
                Premium Classic started with one simple idea: dessert should feel like a warm
                hug, not just something sweet on a plate. From our very first cake parfait
                cup, we&apos;ve focused on flavour, consistency and a homely touch that keeps
                people coming back.
              </p>
              <p className="mt-2">
                Over time, the menu grew into banana breads, fluffy pancakes, fully loaded meat
                pies, sausage rolls, juicy shawarma and yoghurt drinks. But the goal stayed
                the same: give you reliable, tasty treats that make your day softer, your
                gatherings sweeter and your gifts more thoughtful.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                What we bake and make
              </h2>
              <ul className="mt-2 space-y-2">
                <li>
                  <span className="font-semibold text-neutral-900">Parfaits:</span>{' '}
                  Cake parfaits in flavours like chocolate, lemon, red velvet, milky and
                  vanilla, plus yoghurt parfaits for a lighter option.
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">Banana Bread:</span>{' '}
                  From chocolate chunk to no-sugar healthy loaves and mini sets perfect for
                  sharing.
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">Pancakes:</span>{' '}
                  Fluffy stacks with options like Nutella, regular and deluxe pancakes for
                  proper brunch energy.
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">Pastries &amp; Shawarma:</span>{' '}
                  Fully loaded meat pies, sausage rolls and juicy shawarma combinations for
                  when you want something savoury with your sweets.
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">Drinks:</span>{' '}
                  Yoghurt and zobo drinks to round off your order or pair with a dessert box.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                Made for your moments
              </h2>
              <p className="mt-2">
                Premium Classic works beautifully for birthdays, office meetings, surprise
                drops, dessert tables and quiet stay-at-home weekends. You can build a custom
                dessert box with parfaits, banana bread, pastries and shawarma in one order
                or keep it simple with your favourite item in multiples.
              </p>
              <p className="mt-2">
                Whether it&apos;s a solo treat, &quot;thank you&quot; gift, team snack tray
                or a mini celebration, we help you choose portions and combinations that fit.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                How ordering works
              </h2>
              <ol className="mt-2 space-y-2">
                <li>
                  <span className="font-semibold text-neutral-900">1. Browse the menu:</span>{' '}
                  Check all available items and prices on our{' '}
                  <Link
                    href="/menu"
                    className="font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Menu page
                  </Link>
                  .
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">2. Send us a message:</span>{' '}
                  Share what you want to order on WhatsApp.
                </li>
                <li>
                  <span className="font-semibold text-neutral-900">3. Confirm &amp; enjoy:</span>{' '}
                  We will confirm availability, send final pricing, and agree on time for
                  pickup or delivery.
                </li>
              </ol>
              <p className="mt-2 text-xs text-neutral-500">
                Most items are made fresh to order, so please place dessert box or large
                quantity orders ahead of time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-amber-100 bg-white/90 p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Dessert boxes &amp; gifting
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                Build a Premium box that says &quot;you&apos;re special&quot;.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                Mix and match parfaits, banana bread, pastries and shawarma for birthdays,
                anniversaries, &quot;just because&quot; gifts, office treats and family
                movie nights.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Need help deciding portions? Send us your budget and number of people and we will
                suggest combinations that make sense.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
                Reach Premium Classic
              </p>
              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                <p>
                  <span className="font-semibold text-neutral-900">Call:</span>{' '}
                  <a
                    href="tel:+2347072475343"
                    className="text-amber-700 hover:text-amber-800"
                  >
                    070 7247 5343
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-neutral-900">WhatsApp:</span>{' '}
                  <a
                    href="https://wa.me/2348089464118"
                    target="_blank"
                    className="text-emerald-600 hover:text-emerald-500"
                  >
                    0808 946 4118
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-neutral-900">Instagram:</span>{' '}
                  <a
                    href="https://www.instagram.com/premium81985"
                    target="_blank"
                    className="text-amber-700 hover:text-amber-800"
                  >
                    @premium81985
                  </a>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link
                  href="/menu"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 sm:flex-none sm:px-5"
                >
                  View full menu
                </Link>
                <a
                  href="https://wa.me/2348089464118"
                  target="_blank"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-400 sm:flex-none sm:px-5"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/80 p-4 text-xs leading-relaxed text-neutral-700 sm:p-5">
              <p className="font-semibold text-neutral-900">
                Fresh batches, consistent quality.
              </p>
              <p className="mt-2">
                We pay attention to texture, flavour and presentation so that the
                &quot;Premium Classic&quot; you had last month tastes just as good the next
                time you order it or even better.
              </p>
              <p className="mt-2">
                If you&apos;re not sure what to pick, start with a cake parfait and a slice
                of banana bread. It&apos;s a very friendly introduction to our world.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
