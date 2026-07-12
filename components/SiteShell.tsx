'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { Instagram, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
];

const phoneHref = 'tel:+2347072475343';
const whatsappLink = 'https://wa.me/2348089464118';
const instagramLink = 'https://www.instagram.com/premium81985';

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f2e9] text-[#1c1712]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#15100c] text-[#fffaf0] shadow-[0_8px_30px_rgba(21,16,12,0.18)]">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[86rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3" aria-label="Premium Classic home">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md border border-[#dcae5d]/50 bg-[#fffaf0]">
              <Image src="/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 object-contain" priority />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold text-white">Premium Classic</span>
              <span className="block truncate text-[0.7rem] font-semibold text-[#cdbb9e]">Pastries &amp; treats</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3.5 py-2 text-sm font-bold transition ${
                    active ? 'bg-[#dcae5d] text-[#15100c]' : 'text-[#e8dcc9] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a href={instagramLink} target="_blank" rel="noreferrer" title="Instagram" aria-label="Instagram" className="pc-focus grid h-9 w-9 place-items-center rounded-md border border-white/15 text-[#f5e8d2] hover:bg-white/10">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={phoneHref} title="Call Premium Classic" aria-label="Call Premium Classic" className="pc-focus grid h-9 w-9 place-items-center rounded-md border border-white/15 text-[#f5e8d2] hover:bg-white/10">
              <Phone className="h-4 w-4" />
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#dcae5d] px-3.5 text-sm font-extrabold text-[#15100c] hover:bg-[#efc979]">
              <ShoppingBag className="h-4 w-4" />
              Order
            </a>
          </div>

          <button type="button" onClick={() => setOpen(value => !value)} className="pc-focus grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 text-[#fffaf0] md:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[#15100c] px-4 pb-4 pt-3 md:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`rounded-md px-3 py-2.5 text-sm font-bold ${active ? 'bg-[#dcae5d] text-[#15100c]' : 'text-[#f2e5d0] hover:bg-white/10'}`}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <a href={instagramLink} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 text-xs font-bold"><Instagram className="h-4 w-4" /> Instagram</a>
              <a href={phoneHref} className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 text-xs font-bold"><Phone className="h-4 w-4" /> Call</a>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#dcae5d] text-xs font-extrabold text-[#15100c]"><MessageCircle className="h-4 w-4" /> Order</a>
            </div>
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#15100c] text-[#fffaf0]">
        <div className="pc-container py-9">
          <div className="grid gap-7 md:grid-cols-[1.4fr_0.6fr_1fr]">
            <div className="max-w-lg">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-md bg-[#fffaf0]"><Image src="/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 object-contain" /></span>
                <div><p className="text-sm font-extrabold">Premium Classic Pastries</p><p className="text-xs font-semibold text-[#cdbb9e]">Freshly made for everyday moments.</p></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#cdbb9e]">Cake parfaits, banana breads, pancakes, pastries, shawarma and drinks for gifts, office treats and personal cravings.</p>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcae5d]">Explore</p>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-[#e8dcc9]">{navItems.map(item => <Link key={item.href} href={item.href} className="w-fit hover:text-white">{item.label}</Link>)}</div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcae5d]">Contact</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={phoneHref} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-xs font-bold"><Phone className="h-4 w-4" /> Call</a>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#dcae5d] px-3 text-xs font-extrabold text-[#15100c]"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="mt-7 border-t border-white/10 pt-4 text-xs text-[#a99678]">&copy; {new Date().getFullYear()} Premium Classic Pastries. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
