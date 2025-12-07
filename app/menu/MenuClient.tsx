'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
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
};

const WHATSAPP_NUMBER = '2348089464118';

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

export default function MenuClient({ items, fallbackImage }: Props) {
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
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.unitAmount * item.quantity,
        0,
      ),
    [cartItems],
  );

  function openItemModal(item: MenuItem) {
    setActiveItem(item);
    setItemError('');
    setSelectedVariant('');
    setQuantity(1);
  }

  function closeItemModal() {
    setActiveItem(null);
    setItemError('');
    setSelectedVariant('');
    setQuantity(1);
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

    if (!quantity || quantity < 1) {
      setItemError('Please enter a valid quantity (1 or more).');
      return;
    }

    const name = activeItem.name.trim();
    const variantLabel = chosenOption.label ? chosenOption.label.trim() : null;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        ci =>
          ci.id === activeItem.id &&
          (ci.variantLabel || '') === (variantLabel || ''),
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + quantity,
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
      const unit = item.unitAmount;
      const subtotal = unit * item.quantity;
      lines.push(
        `${index + 1}) ${name}${variant} x${item.quantity} (₦${unit.toLocaleString(
          'en-NG',
        )}) = ₦${subtotal.toLocaleString('en-NG')}`,
      );
    });

    lines.push('');
    lines.push(
      `Total: ₦${cartTotal.toLocaleString('en-NG')}`,
    );
    lines.push('');
    lines.push('My details:');
    lines.push(`- Name: ${customerName.trim()}`);
    lines.push(`- Phone: ${customerPhone.trim()}`);

    const message = lines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, '_blank');
    setSubmitting(false);
    setCheckoutOpen(false);
  }

  function handleQuantityChange(value: string) {
    const num = Number(value.replace(/\D/g, ''));
    if (!num) {
      setQuantity(1);
    } else {
      setQuantity(num);
    }
  }

  function handleRemoveFromCart(index: number) {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="mt-8 space-y-8 sm:mt-10">
        {categories.map(category => (
          <section key={category} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                {toTitleCase(category)}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedByCategory[category].map(item => {
                const image = item.imageUrl || fallbackImage;
                const hasPrices =
                  item.pricesJson && item.pricesJson.length > 0;
                return (
                  <article
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-neutral-100 sm:h-36">
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {toTitleCase(item.name)}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-xs text-neutral-600">
                          {item.description}
                        </p>
                      )}
                      {hasPrices && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.pricesJson.map(option => (
                            <span
                              key={option.label}
                              className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                            >
                              {item.pricesJson.length > 1 && (
                                <span className="mr-1">
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
                        className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"
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
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-neutral-900 px-4 py-2.5 text-xs text-white shadow-lg">
            <div className="flex flex-col">
              <span className="font-semibold">
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in order
              </span>
              <span className="text-[11px] text-neutral-300">
                Total: ₦{cartTotal.toLocaleString('en-NG')}
              </span>
            </div>
            <button
              onClick={openCheckout}
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400"
            >
              Review order &amp; send
            </button>
          </div>
        </div>
      )}

      {activeItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {toTitleCase(activeItem.category)}
                </p>
                <h2 className="mt-1 text-base font-semibold text-neutral-900 sm:text-lg">
                  {toTitleCase(activeItem.name)}
                </h2>
                {activeItem.description && (
                  <p className="mt-1 text-[11px] text-neutral-600">
                    {activeItem.description}
                  </p>
                )}
              </div>
              <button
                onClick={closeItemModal}
                className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddToCart} className="space-y-3">
              {activeItem.pricesJson &&
                activeItem.pricesJson.length > 1 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">
                      Size / option
                    </label>
                    <select
                      value={selectedVariant}
                      onChange={e => setSelectedVariant(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Select an option</option>
                      {activeItem.pricesJson.map(option => (
                        <option key={option.label} value={option.label}>
                          {toTitleCase(option.label)} – ₦
                          {option.amount.toLocaleString('en-NG')}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      For example: Full cup, Medium, 3 pieces, 8 pieces.
                    </p>
                  </div>
                )}

              {activeItem.pricesJson &&
                activeItem.pricesJson.length === 1 && (
                  <p className="text-[11px] text-neutral-600">
                    Price: ₦
                    {activeItem.pricesJson[0].amount.toLocaleString('en-NG')}{' '}
                    (no size selection needed).
                  </p>
                )}

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {itemError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {itemError}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
              >
                Add to order
              </button>
            </form>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
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
                className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>

            <div className="mb-3 max-h-40 space-y-2 overflow-y-auto rounded-lg bg-neutral-50 p-3 text-[11px] text-neutral-700">
              {cartItems.map((item, index) => {
                const name = toTitleCase(item.name);
                const variant = item.variantLabel
                  ? ` • ${toTitleCase(item.variantLabel)}`
                  : '';
                const subtotal = item.unitAmount * item.quantity;
                return (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">
                        {name}
                        {variant}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        Qty: {item.quantity} • ₦
                        {item.unitAmount.toLocaleString('en-NG')} each
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-semibold text-neutral-900">
                        ₦{subtotal.toLocaleString('en-NG')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Remove
                      </button>
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
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {submitting ? 'Opening WhatsApp…' : 'Send order on WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
