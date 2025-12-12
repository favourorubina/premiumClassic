'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  src: string;
  alt: string;
};

export default function HomeImagePreview({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-32 w-full overflow-hidden bg-black/40 sm:h-36"
        aria-label="Open image preview"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100" />
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-amber-500/30 bg-black/70 px-3 py-1 text-[11px] font-semibold text-amber-100/90 opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100">
          View
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/85"
            onClick={() => setOpen(false)}
            aria-label="Close modal"
          />

          <div className="relative z-10 w-[min(100%,56rem)] max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-amber-500/25 bg-neutral-950/90 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 border-b border-amber-500/15 px-4 py-3">
              <p className="text-sm font-semibold text-amber-50">Preview</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-amber-500/25 bg-black/60 px-3 py-1 text-xs font-semibold text-amber-100 hover:border-amber-400/40 hover:text-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 overflow-auto bg-black/40">
              <div className="relative h-[min(70vh,34rem)] w-full">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 896px) 100vw, 56rem"
                />
              </div>
            </div>

            <div className="border-t border-amber-500/10 px-4 py-3 text-xs text-amber-100/70">
              Press <span className="font-semibold text-amber-50">Esc</span> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
