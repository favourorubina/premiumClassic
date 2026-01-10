'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toTitleCase } from '@/lib/text';

type PriceOption = {
  label: string;
  amount: number;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string | null;
  pricesJson: PriceOption[];
};

type Props = {
  items: MenuItem[];
  fallbackImage: string;
};

type CartItem = {
  id: string;
  name: string;
  category: string;
  variantLabel: string | null;
  unitAmount: number;
  quantity: number;
  cakeFlavour?: string;
  cakeColor?: string;
};

const WHATSAPP_NUMBER = '2348089464118';

const STORAGE_KEY = 'premiumClassic.menuCart.v1';

function isValidName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return false;
  return parts[0].length >= 2 && parts[1].length >= 2;
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return true;
  if (digits.startsWith('0') && digits.length === 11) return true;
  return false;
}

function extractCakeMeta(description: string | null) {
  const text = description || '';
  const match = text.match(/Cake Customization\s*—\s*(.*)$/m);
  const meta = match?.[1] || '';

  let flavour = '';
  let color = '';

  for (const part of meta.split('•').map(s => s.trim())) {
    const [k, ...rest] = part.split(':');
    const v = rest.join(':').trim();
    const key = (k || '').trim().toLowerCase();
    if (key === 'flavour') flavour = v;
    if (key === 'color') color = v;
  }

  const baseDescription = text.replace(/(\n)?Cake Customization\s*—.*$/m, '').trim();

  return { baseDescription, flavour, color };
}

function ImagePreview({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-32 w-full overflow-hidden bg-neutral-100 sm:h-36"
      aria-label="Open image preview"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-800 opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100">
        View
      </div>
    </button>
  );
}

function ImageViewModal({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative z-10 w-[min(100%,56rem)] max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <p className="text-sm font-semibold text-neutral-900">Preview</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 overflow-auto bg-neutral-50">
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

        <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
          Press <span className="font-semibold text-neutral-900">Esc</span> to close
        </div>
      </div>
    </div>
  );
}

export default function MenuClient({ items, fallbackImage }: Props) {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemError, setItemError] = useState('');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [cakeFlavour, setCakeFlavour] = useState('');
  const [cakeColor, setCakeColor] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cartItems?: CartItem[];
        customerName?: string;
        customerPhone?: string;
      };
      if (Array.isArray(parsed.cartItems)) setCartItems(parsed.cartItems);
      if (typeof parsed.customerName === 'string') setCustomerName(parsed.customerName);
      if (typeof parsed.customerPhone === 'string') setCustomerPhone(parsed.customerPhone);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cartItems, customerName, customerPhone }),
      );
    } catch {
      return;
    }
  }, [cartItems, customerName, customerPhone]);

  const groupedByCategory = useMemo(
    () =>
      items.reduce<Record<string, MenuItem[]>>((acc, item) => {
        const key = item.category?.trim() || 'Others';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {}),
    [items],
  );

  const categories = useMemo(
    () => Object.keys(groupedByCategory).sort((a, b) => a.localeCompare(b)),
    [groupedByCategory],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0),
    [cartItems],
  );

  function openItemModal(item: MenuItem) {
    setActiveItem(item);
    setItemError('');
    setSelectedVariant('');
    setQuantity(1);

    const meta = extractCakeMeta(item.description);
    setCakeFlavour(meta.flavour || '');
    setCakeColor(meta.color || '');
  }

  function closeItemModal() {
    setActiveItem(null);
    setItemError('');
    setSelectedVariant('');
    setQuantity(1);
    setCakeFlavour('');
    setCakeColor('');
  }

  function decModalQty() {
    setQuantity(q => Math.max(1, q - 1));
  }

  function incModalQty() {
    setQuantity(q => q + 1);
  }

  function handleQuantityChange(value: string) {
    const num = Number(value.replace(/\D/g, ''));
    if (!num || num < 1) setQuantity(1);
    else setQuantity(num);
  }

  function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;

    const options = activeItem.pricesJson || [];
    const hasMultiple = options.length > 1;

    let chosenOption: PriceOption | null = null;

    if (hasMultiple) {
      if (!selectedVariant) {
        setItemError('Please choose a size/option for this item.');
        return;
      }
      chosenOption = options.find(o => o.label === selectedVariant) || null;
    } else {
      chosenOption = options[0] || null;
    }

    if (!chosenOption) {
      setItemError('No price option available for this item.');
      return;
    }

    const name = activeItem.name.trim();
    const variantLabel = chosenOption.label ? chosenOption.label.trim() : null;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        ci => ci.id === activeItem.id && (ci.variantLabel || '') === (variantLabel || ''),
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + quantity,
          ...(activeItem.category?.trim() === 'Cake'
            ? {
              cakeFlavour: cakeFlavour.trim() || copy[existingIndex].cakeFlavour,
              cakeColor: cakeColor.trim() || copy[existingIndex].cakeColor,
            }
            : {}),
        };
        return copy;
      }

      return [
        ...prev,
        {
          id: activeItem.id,
          name,
          category: activeItem.category,
          variantLabel,
          unitAmount: chosenOption.amount,
          quantity,
          ...(activeItem.category?.trim() === 'Cake'
            ? {
              cakeFlavour: cakeFlavour.trim(),
              cakeColor: cakeColor.trim(),
            }
            : {}),
        },
      ];
    });

    closeItemModal();
  }

  function openCheckout() {
    if (cartItems.length === 0) return;
    setFormError('');
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setCheckoutOpen(false);
    setFormError('');
    setSubmitting(false);
  }

  function handleRemoveFromCart(index: number) {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }

  function incCartQty(index: number) {
    setCartItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      copy[index] = { ...item, quantity: item.quantity + 1 };
      return copy;
    });
  }

  function decCartQty(index: number) {
    setCartItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const nextQty = item.quantity - 1;
      if (nextQty <= 0) return copy.filter((_, i) => i !== index);
      copy[index] = { ...item, quantity: nextQty };
      return copy;
    });
  }

  function clearStoredCart() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }

  function handleSendOrder(e: React.FormEvent) {
    e.preventDefault();

    if (cartItems.length === 0) {
      setFormError('Your order is empty. Please add at least one item.');
      return;
    }

    if (!isValidName(customerName)) {
      setFormError('Please enter your first and last name.');
      return;
    }

    if (!isValidNigerianPhone(customerPhone)) {
      setFormError('Please enter a valid Nigerian phone number.');
      return;
    }

    setSubmitting(true);

    const lines: string[] = [];
    lines.push('Hello Premium Classic,');
    lines.push('');
    lines.push('I would like to place an order:');
    lines.push('');

    cartItems.forEach((item, index) => {
      const name = toTitleCase(item.name);
      const variant = item.variantLabel ? ` - ${toTitleCase(item.variantLabel)}` : '';
      const cakeMeta =
        item.category?.trim() === 'Cake' && (item.cakeFlavour || item.cakeColor)
          ? ` (Flavour: ${item.cakeFlavour ? toTitleCase(item.cakeFlavour) : '—'}, Color: ${item.cakeColor ? toTitleCase(item.cakeColor) : '—'
          })`
          : '';

      const unit = item.unitAmount;
      const subtotal = unit * item.quantity;
      lines.push(
        `${index + 1}) ${name}${variant}${cakeMeta} x${item.quantity} (₦${unit.toLocaleString(
          'en-NG',
        )}) = ₦${subtotal.toLocaleString('en-NG')}`,
      );
    });

    lines.push('');
    lines.push(`Total: ₦${cartTotal.toLocaleString('en-NG')}`);
    lines.push('');
    lines.push('My details:');
    lines.push(`- Name: ${customerName.trim()}`);
    lines.push(`- Phone: ${customerPhone.trim()}`);

    const message = lines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    setSubmitting(false);
    setCheckoutOpen(false);
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setFormError('');
    clearStoredCart();
  }

  return (
    <>
      <ImageViewModal
        open={!!preview}
        src={preview?.src || fallbackImage}
        alt={preview?.alt || 'Preview'}
        onClose={() => setPreview(null)}
      />

      <div className="mt-8 space-y-8 sm:mt-10">
        {categories.map(category => (
          <section key={category} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-black sm:text-xl">
                {toTitleCase(category)}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedByCategory[category].map(item => {
                const image = item.imageUrl || fallbackImage;
                const hasPrices = item.pricesJson && item.pricesJson.length > 0;

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-amber-500/15 bg-neutral-950/60 shadow-sm transition hover:-translate-y-[2px] hover:border-amber-400/25 hover:shadow-md"
                  >
                    <ImagePreview
                      src={image}
                      alt={item.name}
                      onOpen={() => setPreview({ src: image, alt: item.name })}
                    />

                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="text-sm font-semibold text-amber-50">
                        {toTitleCase(item.name)}
                      </h3>

                      {(() => {
                        const meta = extractCakeMeta(item.description);
                        const showCakeMeta = item.category?.trim() === 'Cake' && (meta.flavour || meta.color);

                        return (
                          <>
                            {meta.baseDescription && (
                              <p className="mt-1 text-xs text-amber-100/70">{meta.baseDescription}</p>
                            )}

                            {showCakeMeta && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {meta.flavour && (
                                  <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                                    Flavour: {toTitleCase(meta.flavour)}
                                  </span>
                                )}
                                {meta.color && (
                                  <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                                    Color: {toTitleCase(meta.color)}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {hasPrices && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.pricesJson.map((option, idx) => (
                            <span
                              key={`${item.id}-${option.label}-${idx}`}
                              className="inline-flex items-center rounded-full border border-amber-500/20 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-amber-100"
                            >
                              {item.pricesJson.length > 1 && (
                                <span className="mr-1 text-amber-200/90">
                                  {toTitleCase(option.label)}:
                                </span>
                              )}
                              ₦{option.amount.toLocaleString('en-NG')}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => openItemModal(item)}
                        className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                      >
                        Add to order
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:pb-6">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-900 shadow-lg">
            <div className="flex flex-col">
              <span className="font-semibold">
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in order
              </span>
              <span className="text-[11px] text-neutral-600">
                Total: ₦{cartTotal.toLocaleString('en-NG')}
              </span>
            </div>

            <button
              onClick={openCheckout}
              className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Review order &amp; send
            </button>
          </div>
        </div>
      )}

      {activeItem && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-2 border-b border-neutral-200 px-4 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {toTitleCase(activeItem.category)}
                </p>
                <h2 className="mt-1 text-base font-semibold text-neutral-900 sm:text-lg">
                  {toTitleCase(activeItem.name)}
                </h2>
                {activeItem.description && (
                  <p className="mt-1 text-[11px] text-neutral-600">{activeItem.description}</p>
                )}
              </div>

              <button
                onClick={closeItemModal}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddToCart} className="space-y-3 px-4 py-4">
              {activeItem.pricesJson && activeItem.pricesJson.length > 1 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">
                    Size / option
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={e => setSelectedVariant(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="">Select an option</option>
                    {activeItem.pricesJson.map((option, idx) => (
                      <option key={`${activeItem.id}-${option.label}-${idx}`} value={option.label}>
                        {toTitleCase(option.label)} – ₦{option.amount.toLocaleString('en-NG')}
                      </option>
                    ))}

                  </select>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    For example: Full cup, Medium, 3 pieces, 8 pieces.
                  </p>
                </div>
              )}

              {activeItem.pricesJson && activeItem.pricesJson.length === 1 && (
                <p className="text-[11px] text-neutral-600">
                  Price: ₦{activeItem.pricesJson[0].amount.toLocaleString('en-NG')} (no size
                  selection needed).
                </p>
              )}

              {activeItem.category?.trim() === 'Cake' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Cake customization</p>
                  <p className="mt-1 text-[11px] text-neutral-600">
                    Choose a flavour and preferred color (optional).
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-700">
                        Flavour
                      </label>
                      <input
                        value={cakeFlavour}
                        onChange={e => setCakeFlavour(e.target.value)}
                        placeholder="Vanilla, Chocolate, Red Velvet..."
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-700">
                        Color
                      </label>
                      <input
                        value={cakeColor}
                        onChange={e => setCakeColor(e.target.value)}
                        placeholder="White, Pink, Blue, Gold..."
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Quantity</label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decModalQty}
                    className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantity}
                    onChange={e => handleQuantityChange(e.target.value)}
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-center text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                    aria-label="Quantity"
                  />

                  <button
                    type="button"
                    onClick={incModalQty}
                    className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {itemError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {itemError}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Add to order
              </button>
            </form>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-2 border-b border-neutral-200 px-4 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Order summary
                </p>
                <h2 className="mt-1 text-base font-semibold text-neutral-900 sm:text-lg">
                  Review and send on WhatsApp
                </h2>
              </div>

              <button
                onClick={closeCheckout}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Close
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] text-neutral-700">
                {cartItems.map((item, index) => {
                  const name = toTitleCase(item.name);
                  const variant = item.variantLabel ? ` • ${toTitleCase(item.variantLabel)}` : '';
                  const cakeMeta =
                    item.category?.trim() === 'Cake' && (item.cakeFlavour || item.cakeColor)
                      ? ` • ${item.cakeFlavour ? `Flavour: ${toTitleCase(item.cakeFlavour)}` : ''}${item.cakeFlavour && item.cakeColor ? ' • ' : ''
                      }${item.cakeColor ? `Color: ${toTitleCase(item.cakeColor)}` : ''}`
                      : '';

                  const subtotal = item.unitAmount * item.quantity;

                  return (
                    <div key={index} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {name}
                          {variant}
                          {cakeMeta}
                        </p>

                        <p className="text-[10px] text-neutral-600">
                          ₦{item.unitAmount.toLocaleString('en-NG')} each
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decCartQty(index)}
                            className="h-7 w-7 rounded-full border border-neutral-200 bg-white text-[12px] font-semibold text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="min-w-[24px] text-center text-[11px] font-semibold text-neutral-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => incCartQty(index)}
                            className="h-7 w-7 rounded-full border border-neutral-200 bg-white text-[12px] font-semibold text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(index)}
                            className="ml-2 text-[10px] font-semibold text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-semibold text-neutral-900">
                          ₦{subtotal.toLocaleString('en-NG')}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-1 border-t border-dashed border-neutral-200 pt-2">
                  <p className="text-[11px] font-semibold text-neutral-900">
                    Total: ₦{cartTotal.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendOrder} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">
                    Full name
                  </label>
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="First and last name"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">
                    Phone (Nigeria)
                  </label>
                  <input
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="0803…, 0703… or +234…"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {formError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  {submitting ? 'Opening WhatsApp…' : 'Send order on WhatsApp'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
