'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy: string;
  className?: string;
  align?: 'center' | 'bottom';
};

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  className = 'max-w-xl',
  align = 'center',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex overflow-y-auto bg-black/70 p-3 backdrop-blur-[2px] sm:p-6 ${
        align === 'bottom' ? 'items-end sm:items-center' : 'items-center'
      } justify-center`}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative my-auto max-h-[calc(100dvh-1.5rem)] w-full overflow-hidden rounded-lg bg-[#fffdf8] text-[#1c1712] shadow-[0_30px_90px_rgba(0,0,0,0.35)] outline-none sm:max-h-[calc(100dvh-3rem)] ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
