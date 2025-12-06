'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

type SiteShellProps = {
  children: ReactNode;
};

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <circle cx="17" cy="7" r="1.3" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4.5 20.2 5.4 17A7.3 7.3 0 0 1 4 12.7 7.4 7.4 0 1 1 17.4 18a7.3 7.3 0 0 1-4.3 1.4 7.4 7.4 0 0 1-3.5-.9z" />
      <path
        d="M10.3 8.1c-.2-.5-.4-.5-.6-.5h-.4a.8.8 0 0 0-.6.3 2.5 2.5 0 0 0-.8 1.9 4.2 4.2 0 0 0 .9 2.2 8.7 8.7 0 0 0 3.4 2.9 3.9 3.9 0 0 0 2.2.7 1.8 1.8 0 0 0 1.2-.6 1.5 1.5 0 0 0 .3-.9c0-.2 0-.3-.2-.3l-1.1-.5c-.3-.2-.5 0-.7.2l-.4.5c-.1.1-.3.1-.5 0a5.2 5.2 0 0 1-1.5-1 6.5 6.5 0 0 1-1-1.3c-.1-.2 0-.3.1-.5l.3-.4a.4.4 0 0 0 0-.4l-.6-1.4z"
        fill="#fff"
      />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M7.1 2.5A2 2 0 0 0 5 4.6v14.8a2 2 0 0 0 2.1 2.1h9.8a2 2 0 0 0 2.1-2.1V4.6A2 2 0 0 0 16.9 2.5H7.1Zm0 1.5h9.8a.5.5 0 0 1 .5.5v11.4H6.6V4.5a.5.5 0 0 1 .5-.5Zm4.9 14.4a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z" />
    </svg>
  );
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Real contact links
  const phoneHref = 'tel:+2347072475343';
  const whatsappLink = 'https://wa.me/2348089464118';
  const instagramLink = 'https://www.instagram.com/premium81985';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-amber-100/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-amber-600/40 bg-amber-50">
              <Image
                src="/logo.jpg"
                alt="Premium Classic Pastries"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
            </div>
            <div className="sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                Premium Classic
              </p>
              <p className="text-xs font-medium text-neutral-900">
                Pastries · Parfaits · Treats
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'rounded-full bg-amber-50 px-3 py-1 text-amber-800'
                      : 'rounded-full px-3 py-1 hover:bg-neutral-100'
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700"
            >
              <InstagramIcon className="h-4 w-4 fill-none stroke-current stroke-[1.3]" />
            </a>
            <a
              href={phoneHref}
              title="Call Premium Classic"
              aria-label="Call Premium Classic"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700"
            >
              <PhoneIcon className="h-4 w-4 fill-current" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-400"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
            </a>
          </div>

          <button
            onClick={() => setOpen(prev => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 hover:bg-neutral-100 md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span className="flex h-3 w-4 flex-col justify-between">
              <span className="h-[1.5px] w-full rounded bg-neutral-800" />
              <span className="h-[1.5px] w-full rounded bg-neutral-800" />
              <span className="h-[1.5px] w-full rounded bg-neutral-800" />
            </span>
          </button>
        </div>

        {open && (
          <div className="border-t border-amber-100/60 bg-white/95 px-4 pb-3 pt-2 md:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
              {navItems.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? 'rounded-xl bg-amber-50 px-3 py-2 text-amber-800'
                        : 'rounded-xl px-3 py-2 hover:bg-neutral-100'
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 flex items-center gap-3">
              <a
                href={phoneHref}
                title="Call Premium Classic"
                aria-label="Call Premium Classic"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100"
              >
                <PhoneIcon className="h-4 w-4 fill-current" />
              </a>
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-100"
              >
                <InstagramIcon className="h-4 w-4 fill-none stroke-current stroke-[1.3]" />
                <span>@premiumclassic</span>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                title="WhatsApp"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-400"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Premium Classic Pastries.</p>
          <div className="flex items-center gap-3">
            <a
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700"
            >
              <InstagramIcon className="h-4 w-4 fill-none stroke-current stroke-[1.3]" />
            </a>
            <a
              href={phoneHref}
              title="Call Premium Classic"
              aria-label="Call Premium Classic"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700"
            >
              <PhoneIcon className="h-4 w-4 fill-current" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-400"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
