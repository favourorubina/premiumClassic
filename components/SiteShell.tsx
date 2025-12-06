"use client";

import { usePathname } from "next/navigation";

function SiteNav() {
  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-xs font-semibold text-white">
            PC
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-neutral-900">
              Premium Classic
            </p>
            <p className="text-[11px] text-neutral-500">
              Indulge in timeless flavors ✨
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-4 text-xs font-medium text-neutral-700 sm:flex">
          <a href="/" className="hover:text-amber-700">
            Home
          </a>
          <a href="/menu" className="hover:text-amber-700">
            Menu
          </a>
          <a href="#contact" className="hover:text-amber-700">
            Contact / Orders
          </a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-neutral-200 bg-white/90 text-xs text-neutral-500"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Premium Classic. Dessert moments, made
          special.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://www.instagram.com/premium81985"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-amber-800 hover:text-amber-900"
          >
            IG: @premium81985
          </a>
          <span className="text-[11px] text-neutral-400">
            Cake parfaits • Banana breads • Pastries
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/sweet-81985");

  return (
    <>
      {!isAdmin && <SiteNav />}
      {children}
      {!isAdmin && <SiteFooter />}
    </>
  );
}
