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

const WHATSAPP_NUMBER = '2340000000000';

function isValidName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return false;
  return parts[0].length >= 2 && parts[1].length >= 2;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return true;
  if (digits.startsWith('0') && digits.length === 11) return true;
  return false;
}

export default function MenuClient({ items, fallbackImage }: Props) {
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
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

  function openOrderModal(item: MenuItem) {
    setActiveItem(item);
    setFormError('');
    setSelectedVariant('');
  }

  function closeOrderModal() {
    setActiveItem(null);
    setFormError('');
    setSubmitting(false);
  }

  function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;

    setFormError('');

    if (!isValidName(customerName)) {
      setFormError('Please enter your first and last name.');
      return;
    }

    if (!isValidEmail(customerEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!isValidNigerianPhone(customerPhone)) {
      setFormError('Please enter a valid Nigerian phone number.');
      return;
    }

    const options = activeItem.pricesJson || [];
    const hasMultiple = options.length > 1;

    let chosenOption: PriceOption | null = null;

    if (hasMultiple) {
      if (!selectedVariant) {
        setFormError('Please choose a size/option for this item.');
        return;
      }
      chosenOption = options.find(o => o.label === selectedVariant) || null;
    } else {
      chosenOption = options[0] || null;
    }

    if (!chosenOption) {
      setFormError('No price option available for this item.');
      return;
    }

    setSubmitting(true);

    const variantPart = hasMultiple ? ` - ${chosenOption.label}` : '';
    const pricePart = ` (₦${chosenOption.amount.toLocaleString('en-NG')})`;

    const messageLines = [
      'Hello Premium Classic,',
      '',
      'I would like to place an order:',
      `- Item: ${activeItem.name}${variantPart}${pricePart}`,
      '',
      'My details:',
      `- Name: ${customerName.trim()}`,
      `- Email: ${customerEmail.trim()}`,
      `- Phone: ${customerPhone.trim()}`,
    ];

    const message = messageLines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, '_blank');
    setSubmitting(false);
    closeOrderModal();
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
              <p className="text-xs text-neutral-500">
                {groupedByCategory[category].length}{' '}
                {groupedByCategory[category].length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedByCategory[category].map(item => {
                const image = item.imageUrl || fallbackImage;
                const hasPrices = item.pricesJson && item.pricesJson.length > 0;
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
                        onClick={() => openOrderModal(item)}
                        className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"
                      >
                        Place order
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

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
                onClick={closeOrderModal}
                className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
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

              {activeItem.pricesJson && activeItem.pricesJson.length > 1 && (
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

              {activeItem.pricesJson && activeItem.pricesJson.length === 1 && (
                <p className="text-[11px] text-neutral-600">
                  Price: ₦
                  {activeItem.pricesJson[0].amount.toLocaleString('en-NG')}{' '}
                  (no size selection needed).
                </p>
              )}

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
