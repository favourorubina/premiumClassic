'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { Instagram, Phone, MessageCircle, Menu, X } from 'lucide-react';

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const phoneHref = 'tel:+2347072475343';
  const whatsappLink = 'https://wa.me/2348089464118';
  const instagramLink = 'https://www.instagram.com/premium81985';

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/menu', label: 'Menu' },
      { href: '/about', label: 'About' },
    ],
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-950/85 text-neutral-50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-amber-500/30 bg-black">
              <Image
                src="/logo.jpg"
                alt="Premium Classic Pastries"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                Premium Classic
              </p>
              <p className="text-xs font-medium text-neutral-100">
                Pastries · Parfaits · Treats
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-semibold text-neutral-100 md:flex">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'rounded-full border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-amber-200'
                      : 'rounded-full px-4 py-2 text-neutral-200 hover:bg-white/5 hover:text-white'
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
            >
              <Instagram className="h-4 w-4" />
            </a>

            <a
              href={phoneHref}
              title="Call Premium Classic"
              aria-label="Call Premium Classic"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
            >
              <Phone className="h-4 w-4" />
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
              className="flex h-9 items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500 px-4 text-sm font-semibold text-black hover:bg-amber-400"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Order</span>
            </a>
          </div>

          <button
            onClick={() => setOpen(prev => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-neutral-100 hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-neutral-950/95 px-4 pb-4 pt-3 md:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-neutral-100">
              {navItems.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? 'rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200'
                        : 'rounded-2xl px-4 py-3 text-neutral-200 hover:bg-white/5 hover:text-white'
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
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>

              <a
                href={phoneHref}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500 px-3 py-3 text-xs font-semibold text-black hover:bg-amber-400"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-amber-500/25 bg-black">
                  <Image
                    src="/logo.jpg"
                    alt="Premium Classic Pastries"
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                    Premium Classic
                  </p>
                  <p className="text-xs text-neutral-300">Pastries · Parfaits · Treats</p>
                </div>
              </div>

              <p className="max-w-sm text-xs leading-relaxed text-neutral-300">
                Gold-standard desserts with a clean, premium finish for gifting, office
                treats, and sweet cravings any day.
              </p>
            </div>

            <div className="grid gap-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-300">
                Pages
              </p>
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-sm text-neutral-200 hover:text-amber-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-300">
                Contact
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>

                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-100 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Premium Classic Pastries. All rights reserved.</p>
            <p className="text-neutral-500">Gold &amp; Black theme · Crafted with care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
