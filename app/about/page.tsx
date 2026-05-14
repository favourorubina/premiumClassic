import Image from 'next/image';
import Link from 'next/link';
import { Gift, MessageCircle, Phone, Sparkles } from 'lucide-react';

const values = [
  {
    title: 'Made fresh',
    text: 'Orders are prepared after confirmation so the texture, taste and finish stay consistent.',
  },
  {
    title: 'Built for gifting',
    text: 'Dessert boxes and treat mixes are easy to personalize for birthdays, offices and thank-you moments.',
  },
  {
    title: 'Sweet plus savoury',
    text: 'Premium Classic brings parfaits, banana bread, pastries, pancakes, shawarma and drinks into one menu.',
  },
];

export default function AboutPage() {
  return (
    <div className="pc-shell min-h-screen">
      <section className="pc-container grid gap-10 pb-12 pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-16">
        <div>
          <p className="pc-eyebrow">About Premium Classic</p>
          <h1 className="font-display mt-3 text-5xl font-semibold leading-none tracking-tight text-[#1b1713] sm:text-6xl">
            Comfort treats with a premium, personal finish.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#6f6358]">
            Premium Classic is a small food studio for soft celebration moments: cake parfaits,
            fluffy pancakes, banana breads, pastries, shawarma, drinks and dessert boxes that
            feel thoughtful without feeling complicated.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu" className="pc-button-primary">
              <Sparkles className="h-4 w-4" />
              Explore menu
            </Link>
            <a href="https://wa.me/2348089464118" target="_blank" className="pc-button-secondary">
              <MessageCircle className="h-4 w-4" />
              Message us
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#3c2b1a1a] bg-[#f4eadb] shadow-xl sm:translate-y-8">
            <Image
              src="/menu/1 chocolate cake parfait - 5000 full cup, 3500 medium cup.jpeg"
              alt="Chocolate cake parfait"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 24vw"
            />
          </div>
          <div className="grid gap-4">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[#3c2b1a1a] bg-[#f4eadb] shadow-xl">
              <Image
                src="/menu/premium deluxe pancake - 6500.jpeg"
                alt="Premium deluxe pancake"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 24vw"
              />
            </div>
            <div className="rounded-[2rem] bg-[#130f0b] p-5 text-[#fff8eb]">
              <Gift className="h-5 w-5 text-[#e4b969]" />
              <p className="mt-3 text-lg font-extrabold">For gifts, meetings and cravings.</p>
              <p className="mt-2 text-sm leading-6 text-[#d8c7ab]">
                Tell us the occasion, your budget and the number of people. We can help shape a
                treat mix that makes sense.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#3c2b1a1a] bg-white/62 py-10">
        <div className="pc-container grid gap-4 md:grid-cols-3">
          {values.map(value => (
            <div key={value.title} className="rounded-3xl border border-[#3c2b1a1a] bg-[#fffaf3] p-5">
              <h2 className="text-lg font-extrabold text-[#1b1713]">{value.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f6358]">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pc-container grid gap-8 py-12 lg:grid-cols-[1fr_0.8fr] lg:py-16">
        <div className="space-y-7 text-sm leading-7 text-[#6f6358]">
          <div>
            <p className="pc-eyebrow">Our story</p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#1b1713]">
              From one parfait cup to a full treat menu.
            </h2>
            <p className="mt-4">
              Premium Classic started from the kind of dessert people remember: familiar,
              creamy, soft, generous and presented with care. The menu grew from cake parfaits
              into banana breads, pancakes, pastry snacks, shawarma and drinks, but the goal
              stayed the same.
            </p>
            <p className="mt-3">
              Every order should feel easy to choose, satisfying to receive and polished enough
              to gift. That is why the menu supports both solo cravings and custom combinations
              for groups.
            </p>
          </div>

          <div>
            <p className="pc-eyebrow">How to order</p>
            <div className="mt-4 grid gap-3">
              {[
                'Browse the menu and add your preferred sizes or portions.',
                'Review your order with your name and phone number.',
                'Send the summary on WhatsApp and wait for confirmation.',
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-3xl border border-[#3c2b1a1a] bg-white/70 p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#130f0b] text-sm font-extrabold text-[#fff8eb]">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-[#5e5147]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] bg-[#130f0b] p-6 text-[#fff8eb] lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e4b969]">
            Reach Premium Classic
          </p>
          <div className="mt-5 grid gap-3">
            <a
              href="tel:+2347072475343"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-[#e4b969]" />
              070 7247 5343
            </a>
            <a
              href="https://wa.me/2348089464118"
              target="_blank"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 font-bold hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-[#e4b969]" />
              0808 946 4118
            </a>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#d8c7ab]">
            For dessert boxes or larger orders, share your date, budget and number of people
            when you message. It makes the recommendation much faster.
          </p>
        </aside>
      </section>
    </div>
  );
}
