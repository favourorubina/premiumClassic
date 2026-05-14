'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { Instagram, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';

type SiteShellProps = {
  children: ReactNode;
};

const phoneHref = 'tel:+2347072475343';
const whatsappLink = 'https://wa.me/2348089464118';
const instagramLink = 'https://www.instagram.com/premium81985';

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/menu', label: 'Menu' },
      { href: '/about', label: 'About' },
    ],
    [],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f6efe3] text-[#15100b]">
      <header className="sticky top-0 z-40 border-b border-[#e4b96933] bg-[#120d08]/95 text-[#fff8eb] shadow-[0_18px_55px_rgba(18,13,8,0.2)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[86rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-[#e4b96966] bg-[#fff8eb] shadow-sm">
              <Image
                src="/logo.jpg"
                alt="Premium Classic Pastries"
                width={38}
                height={38}
                className="h-9 w-9 object-contain"
                priority
              />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[#f2c977]">
                Premium Classic
              </span>
              <span className="block text-xs font-semibold text-[#e7d6ba]">
                Fresh treats and WhatsApp orders
              </span>
            </span>
          </Link>

          <nav className="hidden items-center rounded-2xl border border-white/10 bg-white/8 p-1 text-sm font-bold shadow-sm md:flex">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'rounded-xl bg-[#e4b969] px-4 py-2 text-[#120d08]'
                      : 'rounded-xl px-4 py-2 text-[#f7e6c7] hover:bg-white/10 hover:text-white'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              aria-label="Instagram"
              className="pc-focus grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/8 text-[#fff8eb] hover:bg-white/15"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={phoneHref}
              title="Call Premium Classic"
              aria-label="Call Premium Classic"
              className="pc-focus grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/8 text-[#fff8eb] hover:bg-white/15"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#e4b969] px-4 text-sm font-extrabold text-[#120d08] hover:bg-[#f2c977]"
            >
              <ShoppingBag className="h-4 w-4" />
              Order
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(prev => !prev)}
            className="pc-focus grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/10 text-[#fff8eb] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[#120d08] px-4 pb-4 pt-3 md:hidden">
            <nav className="grid gap-2 text-sm font-bold">
              {navItems.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? 'rounded-2xl bg-[#e4b969] px-4 py-3 text-[#120d08]'
                        : 'rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-[#fff8eb]'
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="grid place-items-center gap-1 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-[11px] font-bold text-[#fff8eb]"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href={phoneHref}
                className="grid place-items-center gap-1 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-[11px] font-bold text-[#fff8eb]"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="grid place-items-center gap-1 rounded-2xl bg-[#e4b969] px-2 py-3 text-[11px] font-extrabold text-[#120d08]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#3c2b1a1a] bg-[#130f0b] text-[#fff8eb]">
        <div className="pc-container py-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.7fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#c88a2d55] bg-black">
                  <Image
                    src="/logo.jpg"
                    alt="Premium Classic Pastries"
                    width={38}
                    height={38}
                    className="h-9 w-9 object-contain"
                  />
                </span>
                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[#e4b969]">
                    Premium Classic
                  </p>
                  <p className="text-sm font-semibold text-[#f7e6c7]">
                    Pre-order treats with a premium finish.
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#d8c7ab]">
                Cake parfaits, banana breads, pancakes, pastries, shawarma and drinks made
                for thoughtful gifts, office treats and everyday cravings.
              </p>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e4b969]">
                Pages
              </p>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-[#f7e6c7]">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} className="w-fit hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e4b969]">
                Contact
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#fff8eb] hover:bg-white/10"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[#fff8eb] hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e4b969] px-4 py-2 text-xs font-extrabold text-[#130f0b] hover:bg-[#f4c879]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-[#bda989] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Premium Classic Pastries. All rights reserved.</p>
            <p>Gold, black and freshly made comfort.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
