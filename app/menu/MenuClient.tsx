'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CurrencySettings, formatMoneyFromNaira } from '@/lib/currency-format';
import { toTitleCase } from '@/lib/text';

type PriceOption = { label: string; amount: number };
type MenuItem = { id: string; name: string; category: string; imageUrl: string; description: string | null; pricesJson: PriceOption[] };
type CartItem = { id: string; name: string; category: string; variantLabel: string | null; unitAmount: number; quantity: number };
type Props = { items: MenuItem[]; fallbackImage: string; currencySettings: CurrencySettings };

const WHATSAPP_NUMBER = '2348089464118';
const STORAGE_KEY = 'premiumClassic.menuCart.v2';

function readStoredOrder() {
  const empty = { cartItems: [] as CartItem[], customerName: '', customerPhone: '' };
  if (typeof window === 'undefined') return empty;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      cartItems: Array.isArray(parsed.cartItems) ? parsed.cartItems : [],
      customerName: typeof parsed.customerName === 'string' ? parsed.customerName : '',
      customerPhone: typeof parsed.customerPhone === 'string' ? parsed.customerPhone : '',
    };
  } catch {
    return empty;
  }
}

function isValidName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts[0].length >= 2 && parts[1].length >= 2;
}

function isValidNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return (digits.startsWith('234') && digits.length === 13) || (digits.startsWith('0') && digits.length === 11);
}

function formatOrderLine(item: CartItem, index: number) {
  const variant = item.variantLabel ? ` (${toTitleCase(item.variantLabel)})` : '';
  const quantity = item.quantity > 1 ? ` x${item.quantity}` : '';
  return `${index + 1}. ${toTitleCase(item.name)}${variant}${quantity}`;
}

export default function MenuClient({ items, fallbackImage, currencySettings }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
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
  const [storedOrderReady, setStoredOrderReady] = useState(false);

  const money = (amount: number) => formatMoneyFromNaira(amount, currencySettings);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const storedOrder = readStoredOrder();
      setCartItems(storedOrder.cartItems);
      setCustomerName(storedOrder.customerName);
      setCustomerPhone(storedOrder.customerPhone);
      setStoredOrderReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storedOrderReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cartItems, customerName, customerPhone }));
    } catch {
      return;
    }
  }, [cartItems, customerName, customerPhone, storedOrderReady]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.category?.trim() || 'Others'))).sort((a, b) => a.localeCompare(b))], [items]);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter(item => {
      const inCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const searchable = `${item.name} ${item.category} ${item.description || ''}`.toLowerCase();
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, query, selectedCategory]);
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  function openItemModal(item: MenuItem) {
    setActiveItem(item);
    setSelectedVariant(item.pricesJson?.length === 1 ? item.pricesJson[0].label : '');
    setQuantity(1);
    setItemError('');
  }

  function closeItemModal() {
    setActiveItem(null);
    setSelectedVariant('');
    setQuantity(1);
    setItemError('');
  }

  function addItemToCart(item: MenuItem, option: PriceOption, itemQuantity = 1) {
    const variantLabel = option.label?.trim() || null;
    setCartItems(previous => {
      const index = previous.findIndex(cartItem => cartItem.id === item.id && (cartItem.variantLabel || '') === (variantLabel || ''));
      if (index >= 0) {
        const copy = [...previous];
        copy[index] = { ...copy[index], quantity: copy[index].quantity + itemQuantity };
        return copy;
      }
      return [...previous, { id: item.id, name: item.name.trim(), category: item.category, variantLabel, unitAmount: option.amount, quantity: itemQuantity }];
    });
  }

  function handleCardAdd(item: MenuItem) {
    const options = item.pricesJson || [];
    if (options.length === 1) {
      addItemToCart(item, options[0], 1);
      return;
    }

    openItemModal(item);
  }

  function handleAddToCart(event: React.FormEvent) {
    event.preventDefault();
    if (!activeItem) return;
    const options = activeItem.pricesJson || [];
    const chosenOption = options.length > 1 ? options.find(option => option.label === selectedVariant) : options[0];
    if (!chosenOption) {
      setItemError(options.length > 1 ? 'Choose a size or option.' : 'This item has no available price yet.');
      return;
    }
    addItemToCart(activeItem, chosenOption, quantity);
    closeItemModal();
  }

  function updateCartQty(index: number, delta: number) {
    setCartItems(previous => {
      const copy = [...previous];
      if (!copy[index]) return previous;
      const next = copy[index].quantity + delta;
      if (next <= 0) return copy.filter((_, itemIndex) => itemIndex !== index);
      copy[index] = { ...copy[index], quantity: next };
      return copy;
    });
  }

  function handleSendOrder(event: React.FormEvent) {
    event.preventDefault();
    if (!cartItems.length) return setFormError('Your order is empty. Add at least one item first.');
    if (!isValidName(customerName)) return setFormError('Enter your first and last name.');
    if (!isValidNigerianPhone(customerPhone)) return setFormError('Enter a valid Nigerian phone number.');

    setSubmitting(true);
    const lines = [
      'Hello Premium Classic,', '', 'I would like to place this order:', '',
      ...cartItems.map(formatOrderLine),
      '', 'Customer details:', `Name: ${customerName.trim()}`, `Phone: ${customerPhone.trim()}`, '', 'Please confirm availability and pickup or delivery details.',
    ];
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    setSubmitting(false);
    setCheckoutOpen(false);
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setFormError('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { return; }
  }

  return (
    <>
      <div className="sticky top-[4.5rem] z-20 -mx-4 border-y border-[#3c2b1a1f] bg-[#f8f2e9]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto grid max-w-[82rem] gap-3 lg:grid-cols-[minmax(15rem,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search menu</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a755f]" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search menu items" className="pc-input pc-search-input h-11" />
            {query && <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#716255] hover:bg-[#eee3d5]" aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </label>
          <div className="pc-scrollbar flex gap-1.5 overflow-x-auto pb-1 lg:max-w-[46rem]">
            {categories.map(category => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`shrink-0 rounded-md border px-3 py-2 text-xs font-extrabold ${selectedCategory === category ? 'border-[#1c1712] bg-[#1c1712] text-white' : 'border-[#3c2b1a24] bg-[#fffdf8] text-[#51463c] hover:border-[#98620f66]'}`}>
                {toTitleCase(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#51463c]"><span className="font-extrabold text-[#1c1712]">{filteredItems.length}</span> menu item{filteredItems.length === 1 ? '' : 's'}</p>
        {selectedCategory !== 'All' && <button type="button" onClick={() => setSelectedCategory('All')} className="text-xs font-extrabold text-[#98620f] hover:underline">Show all</button>}
      </div>

      <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => {
          const hasOptions = item.pricesJson.length > 1;
          return (
            <article key={item.id} className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] shadow-sm transition hover:border-[#98620f66] hover:shadow-lg">
              <button type="button" onClick={() => openItemModal(item)} className="relative aspect-[4/3] w-full overflow-hidden bg-[#e7dac8]" aria-label={`View ${item.name}`}>
                <Image src={item.imageUrl || fallbackImage} alt={item.name} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw" />
              </button>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-[#98620f]">{toTitleCase(item.category)}</p>
                <h2 className="mt-1 line-clamp-2 text-base font-extrabold leading-5 text-[#1c1712]">{toTitleCase(item.name)}</h2>
                {item.description && <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#716255]">{item.description}</p>}
                <div className="mt-3 grid gap-1.5">
                  {item.pricesJson.length ? item.pricesJson.map((price, index) => (
                    <div key={`${price.label}-${index}`} className="flex items-center justify-between gap-2 rounded-md border border-[#3c2b1a1f] bg-[#fbf6ee] px-2.5 py-2 text-xs font-extrabold">
                      <span className="min-w-0 break-words text-[#5f5044]">{toTitleCase(price.label || 'Standard')}</span>
                      <span className="shrink-0 text-[#1c1712]">{money(price.amount)}</span>
                    </div>
                  )) : <p className="rounded-md border border-[#3c2b1a1f] bg-[#fbf6ee] px-2.5 py-2 text-xs font-bold text-[#716255]">Ask for price</p>}
                </div>
                <div className="mt-auto pt-3">
                  <button type="button" onClick={() => handleCardAdd(item)} className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#1c1712] px-3 text-xs font-extrabold text-white hover:bg-[#32271e]"><ShoppingBag className="h-3.5 w-3.5" /> {hasOptions ? 'Choose option' : 'Add to order'}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filteredItems.length && <div className="mt-5 rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] p-5 text-sm font-semibold text-[#716255]">No treats match that search. Try another category or spelling.</div>}

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#3c2b1a24] bg-[#fffdf8]/95 px-3 py-3 shadow-[0_-10px_35px_rgba(32,20,10,0.14)] backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0"><p className="truncate text-sm font-extrabold">{cartCount} item{cartCount === 1 ? '' : 's'} in your order</p><p className="text-xs font-bold text-[#716255]">{money(cartTotal)}</p></div>
            <button type="button" onClick={() => { setFormError(''); setCheckoutOpen(true); }} className="pc-button-primary shrink-0"><ShoppingBag className="h-4 w-4" /> Review order</button>
          </div>
        </div>
      )}

      <Modal open={Boolean(activeItem)} onClose={closeItemModal} labelledBy="item-modal-title" className="max-w-3xl" align="bottom">
        {activeItem && (
          <form onSubmit={handleAddToCart} className="grid max-h-[calc(100dvh-1.5rem)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-h-[calc(100dvh-3rem)] md:grid-cols-[18rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto]">
            <div className="relative h-40 bg-[#e7dac8] md:row-span-2 md:h-auto md:min-h-[28rem]">
              <Image src={activeItem.imageUrl || fallbackImage} alt={activeItem.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 288px" />
            </div>
            <div className="pc-scrollbar min-h-0 overflow-y-auto p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#98620f]">{toTitleCase(activeItem.category)}</p><h2 id="item-modal-title" className="mt-1 text-xl font-extrabold leading-6 sm:text-2xl">{toTitleCase(activeItem.name)}</h2></div>
                <button type="button" onClick={closeItemModal} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#3c2b1a24] bg-white" aria-label="Close item"><X className="h-4 w-4" /></button>
              </div>
              {activeItem.description && <p className="mt-3 text-sm font-semibold leading-6 text-[#716255]">{activeItem.description}</p>}

              <fieldset className="mt-5">
                <legend className="text-sm font-extrabold">{activeItem.pricesJson.length > 1 ? 'Choose an option' : 'Price'}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {activeItem.pricesJson.map((option, index) => {
                    const selected = selectedVariant === option.label;
                    return (
                      <label key={`${option.label}-${index}`} className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 ${selected ? 'border-[#1c1712] bg-[#1c1712] text-white' : 'border-[#3c2b1a24] bg-white hover:border-[#98620f66]'}`}>
                        <input type="radio" name="variant" value={option.label} checked={selected} onChange={event => setSelectedVariant(event.target.value)} className="sr-only" />
                        <span><span className="block text-sm font-extrabold">{toTitleCase(option.label || 'Standard')}</span><span className={`mt-0.5 block text-xs font-bold ${selected ? 'text-[#ead6b3]' : 'text-[#716255]'}`}>{money(option.amount)}</span></span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-[#efc979]" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#3c2b1a1f] pt-4">
                <p className="text-sm font-extrabold">Quantity</p>
                <div className="flex items-center rounded-md border border-[#3c2b1a24] bg-white">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-10 w-10 place-items-center" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                  <input value={quantity} onChange={event => setQuantity(Math.max(1, Number(event.target.value.replace(/\D/g, '')) || 1))} inputMode="numeric" className="h-10 w-12 border-x border-[#3c2b1a24] text-center text-sm font-extrabold outline-none" aria-label="Quantity" />
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="grid h-10 w-10 place-items-center" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              {itemError && <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{itemError}</p>}
            </div>
            <div className="border-t border-[#3c2b1a1f] bg-[#fffdf8] p-3 sm:p-4">
              <button type="submit" className="pc-button-primary w-full"><ShoppingBag className="h-4 w-4" /> Add to order</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} labelledBy="checkout-title" className="max-w-lg" align="bottom">
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3c2b1a1f] px-4 py-4 sm:px-5">
            <div><p className="pc-eyebrow">Order summary</p><h2 id="checkout-title" className="mt-1 text-xl font-extrabold">Review and send</h2></div>
            <button type="button" onClick={() => setCheckoutOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#3c2b1a24] bg-white" aria-label="Close checkout"><X className="h-4 w-4" /></button>
          </header>
          <div className="pc-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="divide-y divide-[#3c2b1a1f] rounded-md border border-[#3c2b1a24] bg-white px-3">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.variantLabel}-${index}`} className="flex gap-3 py-3">
                  <div className="min-w-0 flex-1"><p className="text-sm font-extrabold leading-5">{toTitleCase(item.name)}{item.variantLabel ? ` - ${toTitleCase(item.variantLabel)}` : ''}</p><p className="mt-0.5 text-xs font-bold text-[#716255]">{money(item.unitAmount)} each</p>
                    <div className="mt-2 flex items-center gap-1"><button type="button" onClick={() => updateCartQty(index, -1)} className="grid h-8 w-8 place-items-center rounded-md border border-[#3c2b1a24]" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button><span className="min-w-8 text-center text-sm font-extrabold">{item.quantity}</span><button type="button" onClick={() => updateCartQty(index, 1)} className="grid h-8 w-8 place-items-center rounded-md border border-[#3c2b1a24]" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setCartItems(previous => previous.filter((_, itemIndex) => itemIndex !== index))} className="ml-1 grid h-8 w-8 place-items-center rounded-md text-red-700 hover:bg-red-50" aria-label="Remove item"><Trash2 className="h-3.5 w-3.5" /></button></div>
                  </div>
                  <p className="text-sm font-extrabold">{money(item.unitAmount * item.quantity)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 text-sm font-extrabold"><span>Total</span><span>{money(cartTotal)}</span></div>
            </div>

            <form id="checkout-form" onSubmit={handleSendOrder} className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-xs font-extrabold">Full name<input value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="First and last name" className="pc-input" autoComplete="name" /></label>
              <label className="grid gap-1.5 text-xs font-extrabold">Phone number<input value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder="0803... or +234..." className="pc-input" inputMode="tel" autoComplete="tel" /></label>
              {formError && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
            </form>
          </div>
          <footer className="shrink-0 border-t border-[#3c2b1a1f] bg-[#fffdf8] p-3 sm:p-4"><button form="checkout-form" type="submit" disabled={submitting} className="pc-button-primary w-full disabled:opacity-60">{submitting ? 'Opening WhatsApp...' : 'Send order on WhatsApp'}</button></footer>
        </div>
      </Modal>
    </>
  );
}
