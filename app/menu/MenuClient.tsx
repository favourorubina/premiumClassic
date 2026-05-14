'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
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
const STORAGE_KEY = 'premiumClassic.menuCart.v2';

function readStoredOrder() {
  if (typeof window === 'undefined') {
    return { cartItems: [] as CartItem[], customerName: '', customerPhone: '' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cartItems: [] as CartItem[], customerName: '', customerPhone: '' };
    const parsed = JSON.parse(raw) as {
      cartItems?: CartItem[];
      customerName?: string;
      customerPhone?: string;
    };

    return {
      cartItems: Array.isArray(parsed.cartItems) ? parsed.cartItems : [],
      customerName: typeof parsed.customerName === 'string' ? parsed.customerName : '',
      customerPhone: typeof parsed.customerPhone === 'string' ? parsed.customerPhone : '',
    };
  } catch {
    return { cartItems: [] as CartItem[], customerName: '', customerPhone: '' };
  }
}

function money(amount: number) {
  return `NGN ${amount.toLocaleString('en-NG')}`;
}

function isValidName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts[0].length >= 2 && parts[1].length >= 2;
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return true;
  if (digits.startsWith('0') && digits.length === 11) return true;
  return false;
}

function getLowestPrice(item: MenuItem) {
  const amounts = (item.pricesJson || []).map(price => price.amount).filter(Boolean);
  if (amounts.length === 0) return null;
  return Math.min(...amounts);
}

export default function MenuClient({ items, fallbackImage }: Props) {
  const [storedOrder] = useState(readStoredOrder);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemError, setItemError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>(storedOrder.cartItems);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState(storedOrder.customerName);
  const [customerPhone, setCustomerPhone] = useState(storedOrder.customerPhone);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const categories = useMemo(() => {
    const names = Array.from(new Set(items.map(item => item.category?.trim() || 'Others')));
    return ['All', ...names.sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter(item => {
      const inCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const searchable = `${item.name} ${item.category} ${item.description || ''}`.toLowerCase();
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, query, selectedCategory]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0),
    [cartItems],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  function openItemModal(item: MenuItem) {
    setActiveItem(item);
    setSelectedVariant('');
    setQuantity(1);
    setItemError('');
  }

  function closeItemModal() {
    setActiveItem(null);
    setSelectedVariant('');
    setQuantity(1);
    setItemError('');
  }

  function changeModalQty(next: number) {
    setQuantity(Math.max(1, next));
  }

  function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;

    const options = activeItem.pricesJson || [];
    const needsChoice = options.length > 1;
    const chosenOption = needsChoice
      ? options.find(option => option.label === selectedVariant)
      : options[0];

    if (needsChoice && !selectedVariant) {
      setItemError('Please choose a size or option.');
      return;
    }

    if (!chosenOption) {
      setItemError('This item has no available price option yet.');
      return;
    }

    const variantLabel = chosenOption.label ? chosenOption.label.trim() : null;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === activeItem.id && (item.variantLabel || '') === (variantLabel || ''),
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
          name: activeItem.name.trim(),
          category: activeItem.category,
          variantLabel,
          unitAmount: chosenOption.amount,
          quantity,
        },
      ];
    });

    closeItemModal();
  }

  function updateCartQty(index: number, delta: number) {
    setCartItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const nextQuantity = item.quantity + delta;
      if (nextQuantity <= 0) return copy.filter((_, itemIndex) => itemIndex !== index);
      copy[index] = { ...item, quantity: nextQuantity };
      return copy;
    });
  }

  function removeCartItem(index: number) {
    setCartItems(prev => prev.filter((_, itemIndex) => itemIndex !== index));
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
      setFormError('Your order is empty. Add at least one item first.');
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

    const lines = [
      'Hello Premium Classic,',
      '',
      'I would like to place this order:',
      '',
      ...cartItems.map((item, index) => {
        const variant = item.variantLabel ? ` - ${toTitleCase(item.variantLabel)}` : '';
        const subtotal = item.unitAmount * item.quantity;
        return `${index + 1}. ${toTitleCase(item.name)}${variant} x${item.quantity} (${money(
          item.unitAmount,
        )} each) = ${money(subtotal)}`;
      }),
      '',
      `Total: ${money(cartTotal)}`,
      '',
      'My details:',
      `- Name: ${customerName.trim()}`,
      `- Phone: ${customerPhone.trim()}`,
    ];

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');

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
      <div className="mt-8 rounded-[1.5rem] border border-[#2c211733] bg-[#17110b] p-4 text-[#fff8eb] shadow-[0_22px_70px_rgba(32,20,10,0.16)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98620f]" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search parfaits, pancakes, shawarma..."
              className="pc-focus h-12 w-full rounded-xl border border-white/10 bg-[#fffaf3] pl-11 pr-4 text-sm font-bold text-[#15100b] placeholder:text-[#7f705f]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-xl">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? 'shrink-0 rounded-xl bg-[#e4b969] px-4 py-2 text-xs font-extrabold text-[#120d08]'
                    : 'shrink-0 rounded-xl border border-white/10 bg-white/8 px-4 py-2 text-xs font-extrabold text-[#f7e6c7] hover:bg-white/15'
                }
              >
                {toTitleCase(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map(item => {
          const image = item.imageUrl || fallbackImage;
          const lowest = getLowestPrice(item);

          return (
            <article
              key={item.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2c211724] bg-[#fffdf8] shadow-[0_10px_34px_rgba(32,20,10,0.08)] transition hover:-translate-y-1 hover:border-[#98620f66] hover:shadow-[0_18px_50px_rgba(32,20,10,0.14)]"
            >
              <button
                type="button"
                onClick={() => openItemModal(item)}
                className="relative block aspect-[16/10] w-full overflow-hidden bg-[#ded0bd]"
                aria-label={`Open ${item.name}`}
              >
                <Image
                  src={image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </button>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#98620f]">
                      {toTitleCase(item.category)}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold leading-7 text-[#15100b]">
                      {toTitleCase(item.name)}
                    </h3>
                  </div>
                  {lowest && (
                    <span className="shrink-0 rounded-xl bg-[#f1e5d3] px-3 py-1 text-xs font-extrabold text-[#15100b]">
                      {money(lowest)}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#5a4a3b]">
                    {item.description}
                  </p>
                )}

                {item.pricesJson?.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.pricesJson.slice(0, 3).map((option, index) => (
                      <span
                        key={`${item.id}-${option.label}-${index}`}
                        className="rounded-lg border border-[#2c211724] bg-[#f6efe3] px-2.5 py-1 text-[11px] font-extrabold text-[#5a4a3b]"
                      >
                        {toTitleCase(option.label)}: {money(option.amount)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => openItemModal(item)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15100b] px-4 text-sm font-extrabold text-[#fff8eb] transition hover:bg-[#2a2017]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to order
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="pc-card mt-6 rounded-3xl p-6 text-sm text-[#6f6358]">
          No matching treats yet. Try another category or search term.
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:pb-6">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-[#3c2b1a1a] bg-[#fffaf3]/95 px-4 py-3 text-[#1b1713] shadow-2xl backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">
                {cartCount} item{cartCount > 1 ? 's' : ''} in order
              </p>
              <p className="text-xs font-bold text-[#6f6358]">Total: {money(cartTotal)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setCheckoutOpen(true);
              }}
              className="pc-button-primary shrink-0"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {activeItem && (
        <div className="fixed inset-0 z-50 grid items-end bg-black/76 p-0 sm:place-items-center sm:p-5">
          <div className="relative grid max-h-[92dvh] w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-t-3xl bg-[#fffdf8] shadow-2xl sm:max-w-5xl sm:rounded-3xl md:max-h-[88dvh] md:grid-cols-[0.95fr_1.05fr] md:grid-rows-none">
            <button
              type="button"
              onClick={closeItemModal}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-2xl bg-[#15100b] text-white shadow-lg sm:h-11 sm:w-11"
              aria-label="Close item"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-40 bg-[#ded0bd] sm:h-64 md:h-auto md:min-h-[32rem]">
              <Image
                src={activeItem.imageUrl || fallbackImage}
                alt={activeItem.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 48vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 md:bg-gradient-to-r md:from-black/20 md:to-transparent" />
            </div>

            <form onSubmit={handleAddToCart} className="flex min-h-0 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-4 sm:p-7">
                <div className="flex items-start justify-between gap-4 pr-10">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#98620f] sm:text-xs sm:tracking-[0.22em]">
                      {toTitleCase(activeItem.category)}
                    </p>
                    <h2 className="font-display mt-1 text-2xl font-semibold leading-tight text-[#15100b] sm:mt-2 sm:text-4xl">
                      {toTitleCase(activeItem.name)}
                    </h2>
                  </div>
                  {activeItem.pricesJson?.length === 1 && (
                    <span className="mt-1 shrink-0 rounded-xl bg-[#15100b] px-3 py-2 text-[11px] font-extrabold text-[#fff8eb] sm:text-xs">
                      {money(activeItem.pricesJson[0].amount)}
                    </span>
                  )}
                </div>

                {activeItem.description && (
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#5a4a3b] sm:mt-4 sm:text-base sm:leading-7">
                    {activeItem.description}
                  </p>
                )}

                {activeItem.pricesJson?.length > 1 && (
                  <div className="mt-4 sm:mt-6">
                    <p className="text-sm font-extrabold text-[#15100b]">Choose an option</p>
                    <div className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-2">
                      {activeItem.pricesJson.map((option, index) => (
                        <label
                          key={`${activeItem.id}-${option.label}-${index}`}
                          className={
                            selectedVariant === option.label
                              ? 'cursor-pointer rounded-2xl border border-[#15100b] bg-[#15100b] p-3 text-[#fff8eb] sm:p-4'
                              : 'cursor-pointer rounded-2xl border border-[#2c211724] bg-[#f6efe3] p-3 text-[#15100b] hover:border-[#98620f66] sm:p-4'
                          }
                        >
                          <input
                            type="radio"
                            name="variant"
                            value={option.label}
                            checked={selectedVariant === option.label}
                            onChange={event => setSelectedVariant(event.target.value)}
                            className="sr-only"
                          />
                          <span className="block text-sm font-extrabold">
                            {toTitleCase(option.label)}
                          </span>
                          <span className="mt-1 block text-xs font-bold opacity-80">
                            {money(option.amount)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#2c211724] bg-[#f6efe3] p-3 sm:mt-6">
                  <p className="text-sm font-extrabold text-[#15100b]">Quantity</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeModalQty(quantity - 1)}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-[#2c211724] bg-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      value={quantity}
                      onChange={event =>
                        changeModalQty(Number(event.target.value.replace(/\D/g, '')) || 1)
                      }
                      inputMode="numeric"
                      className="h-10 w-16 rounded-xl border border-[#2c211724] bg-white text-center text-sm font-extrabold"
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      onClick={() => changeModalQty(quantity + 1)}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-[#2c211724] bg-white"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {itemError && (
                  <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    {itemError}
                  </p>
                )}
              </div>

              <div className="shrink-0 border-t border-[#2c211724] bg-[#fffdf8] p-3 sm:p-5">
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15100b] px-4 text-sm font-extrabold text-[#fff8eb] transition hover:bg-[#2a2017]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[2rem] bg-[#fffaf3] shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#3c2b1a1a] p-5">
              <div>
                <p className="pc-eyebrow">Order summary</p>
                <h2 className="font-display mt-1 text-3xl font-semibold text-[#1b1713]">
                  Review and send
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#3c2b1a1a] bg-white"
                aria-label="Close checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-2 rounded-3xl border border-[#3c2b1a1a] bg-white p-3">
                {cartItems.map((item, index) => {
                  const subtotal = item.unitAmount * item.quantity;
                  return (
                    <div key={`${item.id}-${item.variantLabel}-${index}`} className="flex gap-3 border-b border-[#3c2b1a12] pb-3 last:border-b-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-[#1b1713]">
                          {toTitleCase(item.name)}
                          {item.variantLabel ? ` - ${toTitleCase(item.variantLabel)}` : ''}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#6f6358]">
                          {money(item.unitAmount)} each
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCartQty(index, -1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-[#3c2b1a1a]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-extrabold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(index, 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-[#3c2b1a1a]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCartItem(index)}
                            className="ml-1 grid h-8 w-8 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-extrabold text-[#1b1713]">{money(subtotal)}</p>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between border-t border-dashed border-[#3c2b1a33] pt-3">
                  <p className="font-extrabold text-[#1b1713]">Total</p>
                  <p className="font-extrabold text-[#1b1713]">{money(cartTotal)}</p>
                </div>
              </div>

              <form onSubmit={handleSendOrder} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm font-bold text-[#1b1713]">
                  Full name
                  <input
                    value={customerName}
                    onChange={event => setCustomerName(event.target.value)}
                    placeholder="First and last name"
                    className="pc-focus h-11 rounded-2xl border border-[#3c2b1a1a] bg-white px-4 text-sm font-semibold"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-[#1b1713]">
                  Phone number
                  <input
                    value={customerPhone}
                    onChange={event => setCustomerPhone(event.target.value)}
                    placeholder="0803..., 0703... or +234..."
                    className="pc-focus h-11 rounded-2xl border border-[#3c2b1a1a] bg-white px-4 text-sm font-semibold"
                  />
                </label>

                {formError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    {formError}
                  </p>
                )}

                <button type="submit" disabled={submitting} className="pc-button-primary w-full disabled:opacity-60">
                  {submitting ? 'Opening WhatsApp...' : 'Send order on WhatsApp'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
