'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  PoundSterling,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import {
  CurrencyCode,
  CurrencySettings,
  DEFAULT_CURRENCY_SETTINGS,
  formatMoneyFromNaira,
  formatRateLabel,
} from '@/lib/currency-format';
import { toTitleCase } from '@/lib/text';

type PriceOption = { label: string; amount: number };
type PriceFormOption = { label: string; amount: string };
type MenuForm = { id: string; name: string; category: string; imageUrl: string; description: string; prices: PriceFormOption[] };
type MenuItem = { id: string; name: string; category: string; imageUrl: string; description?: string | null; pricesJson: PriceOption[] };

const BASE_CATEGORIES = ['Parfait', 'Banana Bread', 'Pancake', 'Pastries', 'Shawarma', 'Cake Slice', 'Cake', 'Drinks'];
const ADMIN_LOGIN_PATH = '/bima/admin/login';

function createEmptyForm(): MenuForm {
  return { id: '', name: '', category: '', imageUrl: '', description: '', prices: [{ label: 'Standard', amount: '' }] };
}

export default function AdminDashboard() {
  const [sessionChecking, setSessionChecking] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MenuForm>(createEmptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY_SETTINGS);
  const [exchangeRateInput, setExchangeRateInput] = useState('');
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  async function loadItems() {
    setLoading(true);
    try {
      const response = await fetch('/api/menu-items');
      if (!response.ok) throw new Error('Failed to load items');
      setItems(await response.json());
    } catch {
      setError('Could not load the menu. Refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const response = await fetch('/api/site-settings');
      if (response.ok) {
        const settings = await response.json();
        setCurrencySettings(settings);
        setExchangeRateInput(settings.ngnToGbpRate ? String(settings.ngnToGbpRate) : '');
      }
    } catch {
      return;
    }
  }

  useEffect(() => {
    async function start() {
      try {
        const session = await fetch('/api/admin/session');
        if (!session.ok) {
          await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
          window.location.replace(ADMIN_LOGIN_PATH);
          return;
        }
        await Promise.all([loadItems(), loadSettings()]);
      } finally {
        setSessionChecking(false);
      }
    }
    start();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const categories = useMemo(() => Array.from(new Set([...BASE_CATEGORIES, ...items.map(item => item.category).filter(Boolean)])), [items]);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => (filterCategory === 'All' || item.category === filterCategory) && (!normalized || `${item.name} ${item.category} ${item.description || ''}`.toLowerCase().includes(normalized)));
  }, [filterCategory, items, query]);
  const money = (amount: number) => formatMoneyFromNaira(amount, currencySettings);

  function handleUnauthorized(response: Response) {
    if (response.status !== 401) return false;
    window.location.replace(ADMIN_LOGIN_PATH);
    return true;
  }

  function normalizePrices(rows: PriceFormOption[]): PriceOption[] {
    return rows.map((row, index) => {
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Add a valid amount for price option ${index + 1}.`);
      }

      return { label: toTitleCase(row.label.trim() || 'Standard'), amount };
    });
  }

  function resetForm() {
    setForm(createEmptyForm());
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function updatePriceRow(index: number, field: keyof PriceFormOption, value: string) {
    setForm(previous => ({
      ...previous,
      prices: previous.prices.map((price, priceIndex) => (priceIndex === index ? { ...price, [field]: value } : price)),
    }));
  }

  function addPriceRow() {
    setForm(previous => ({ ...previous, prices: [...previous.prices, { label: '', amount: '' }] }));
  }

  function removePriceRow(index: number) {
    setForm(previous => ({
      ...previous,
      prices: previous.prices.length > 1 ? previous.prices.filter((_, priceIndex) => priceIndex !== index) : previous.prices,
    }));
  }

  function startEdit(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || '',
      prices: item.pricesJson.length
        ? item.pricesJson.map(price => ({ label: toTitleCase(price.label || 'Standard'), amount: String(price.amount || '') }))
        : [{ label: 'Standard', amount: '' }],
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setActiveItem(null);
    setNotice('Editing selected menu item.');
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) return form.imageUrl;
    const data = new FormData();
    data.append('file', imageFile);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: data });
    if (handleUnauthorized(response)) throw new Error('Your session expired.');
    if (!response.ok) throw new Error('Image upload failed. Try a smaller image.');
    return (await response.json()).url as string;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const prices = normalizePrices(form.prices);
      if (!prices.length) throw new Error('Add at least one valid price.');
      const imageUrl = await uploadImageIfNeeded();
      const response = await fetch(form.id ? `/api/menu-items/${form.id}` : '/api/menu-items', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), category: form.category, imageUrl, description: form.description.trim(), prices }),
      });
      if (handleUnauthorized(response)) return;
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Could not save this menu item.');
      }
      const action = form.id ? 'updated' : 'added';
      resetForm();
      await loadItems();
      setNotice(`Menu item ${action} successfully.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save this menu item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`Delete ${toTitleCase(item.name)}? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await fetch(`/api/menu-items/${item.id}`, { method: 'DELETE' });
      if (handleUnauthorized(response)) return;
      if (!response.ok) throw new Error('Could not delete this menu item.');
      setActiveItem(null);
      if (form.id === item.id) resetForm();
      await loadItems();
      setNotice('Menu item deleted.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this menu item.');
    }
  }

  async function handleCurrencyChange(activeCurrency: CurrencyCode, refreshRate = false, manualRate?: number) {
    setSavingCurrency(true);
    setError('');
    try {
      const response = await fetch('/api/site-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeCurrency, refreshRate, ngnToGbpRate: manualRate }) });
      if (handleUnauthorized(response)) return;
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || 'Could not update currency.');
      setCurrencySettings(body);
      setExchangeRateInput(body.ngnToGbpRate ? String(body.ngnToGbpRate) : '');
      setNotice('Store currency updated.');
    } catch (currencyError) {
      setError(currencyError instanceof Error ? currencyError.message : 'Could not update currency.');
    } finally {
      setSavingCurrency(false);
    }
  }

  function handleManualRateSave() {
    const rate = Number(exchangeRateInput);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError('Enter a valid GBP exchange rate greater than 0.');
      return;
    }
    handleCurrencyChange('GBP', false, rate);
  }

  const hasValidPrices = form.prices.length > 0 && form.prices.every(price => Number(price.amount) > 0);

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch('/api/admin/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      if (handleUnauthorized(response)) return;
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || 'Could not change the password.');
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice('Admin password changed. The old password and older sessions are no longer valid.');
    } catch (passwordChangeError) {
      setPasswordError(passwordChangeError instanceof Error ? passwordChangeError.message : 'Could not change the password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.replace(ADMIN_LOGIN_PATH);
  }

  if (sessionChecking) {
    return <main className="grid min-h-screen place-items-center bg-[#f1e6d7]"><div className="flex items-center gap-3 text-sm font-extrabold text-[#51463c]"><RefreshCw className="h-4 w-4 animate-spin" /> Opening admin workspace...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f1e6d7] text-[#1c1712]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#15100c] text-white shadow-lg">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[86rem] items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-[#fffaf0]"><Image src="/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 object-contain" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-extrabold">Premium Classic Admin</p><p className="truncate text-[0.7rem] font-semibold text-[#cdbb9e]">Menu and store settings</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={() => setPasswordOpen(true)} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-[#f2e5d0] hover:bg-white/10 sm:hidden" aria-label="Change password"><KeyRound className="h-4 w-4" /></button>
            <button type="button" onClick={() => window.open('/', '_blank')} className="hidden h-9 items-center gap-2 rounded-md border border-white/15 px-3 text-xs font-extrabold text-[#f2e5d0] hover:bg-white/10 sm:inline-flex"><ExternalLink className="h-4 w-4" /> View site</button>
            <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#dcae5d] px-3 text-xs font-extrabold text-[#15100c] hover:bg-[#efc979]"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Log out</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[86rem] px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] px-4 py-3"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#7b6b5b]">Menu items</p><p className="mt-1 text-xl font-extrabold">{items.length}</p></div>
          <div className="rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] px-4 py-3"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#7b6b5b]">Categories</p><p className="mt-1 text-xl font-extrabold">{new Set(items.map(item => item.category)).size}</p></div>
          <div className="rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] px-4 py-3"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#7b6b5b]">Display currency</p><p className="mt-1 text-xl font-extrabold">{currencySettings.activeCurrency}</p></div>
        </div>

        <section className="mt-4 rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-sm font-extrabold">Store settings</p><p className="mt-1 text-xs font-semibold text-[#716255]">{formatRateLabel(currencySettings)}</p></div>
            <div className="flex flex-wrap gap-2">
              {(['NGN', 'GBP'] as CurrencyCode[]).map(currency => (
                <button key={currency} type="button" disabled={savingCurrency} onClick={() => handleCurrencyChange(currency)} className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-extrabold ${currencySettings.activeCurrency === currency ? 'border-[#1c1712] bg-[#1c1712] text-white' : 'border-[#3c2b1a2e] bg-white hover:border-[#98620f66]'}`}>
                  {currency === 'NGN' ? <Banknote className="h-4 w-4" /> : <PoundSterling className="h-4 w-4" />}{currency === 'NGN' ? 'Naira' : 'Pound'}
                </button>
              ))}
              {currencySettings.activeCurrency === 'GBP' && <button type="button" disabled={savingCurrency} onClick={() => handleCurrencyChange('GBP', true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#98620f55] bg-[#fff9ed] px-3 text-xs font-extrabold text-[#8c5c15]"><RefreshCw className={`h-4 w-4 ${savingCurrency ? 'animate-spin' : ''}`} /> Refresh rate</button>}
              <button type="button" onClick={() => setPasswordOpen(true)} className="hidden h-9 items-center gap-2 rounded-md border border-[#3c2b1a2e] bg-white px-3 text-xs font-extrabold hover:border-[#98620f66] sm:inline-flex"><KeyRound className="h-4 w-4" /> Change password</button>
            </div>
          </div>
          {currencySettings.activeCurrency === 'GBP' && (
            <div className="mt-4 grid gap-2 border-t border-[#3c2b1a1f] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="grid gap-1.5 text-xs font-extrabold">Current GBP rate
                <input value={exchangeRateInput} onChange={event => setExchangeRateInput(event.target.value)} inputMode="decimal" placeholder="0.00049" className="pc-input h-10" />
              </label>
              <button type="button" disabled={savingCurrency || !exchangeRateInput} onClick={handleManualRateSave} className="pc-button-secondary min-h-10 disabled:cursor-not-allowed disabled:opacity-50"><PoundSterling className="h-4 w-4" /> Save rate</button>
            </div>
          )}
        </section>

        {notice && <div role="status" className="mt-4 flex items-start justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}
        {error && <div role="alert" className="mt-4 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(21rem,0.78fr)_minmax(0,1.22fr)] xl:items-start">
          <section ref={formRef} className="scroll-mt-24 rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] shadow-sm">
            <header className="flex items-start justify-between gap-3 border-b border-[#3c2b1a1f] px-4 py-4">
              <div><h1 className="text-base font-extrabold">{form.id ? 'Edit menu item' : 'Add menu item'}</h1><p className="mt-1 text-xs font-semibold text-[#716255]">Keep names clear and images focused on the food.</p></div>
              {form.id && <button type="button" onClick={resetForm} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#3c2b1a24] bg-white px-2.5 text-xs font-extrabold"><Plus className="h-4 w-4" /> New</button>}
            </header>
            <form onSubmit={handleSubmit} className="grid gap-3 p-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-extrabold">Name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Chocolate cake parfait" className="pc-input" /></label>
              <label className="grid gap-1.5 text-xs font-extrabold">Category<select required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="pc-input"><option value="">Select category</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
              <label className="grid gap-1.5 text-xs font-extrabold sm:col-span-2">Description <span className="font-semibold text-[#8a755f]">(optional)</span><textarea rows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Short description for customers" className="pc-input min-h-20 resize-y" /></label>
              <div className="grid gap-2 sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold">Prices in NGN</p>
                  <button type="button" onClick={addPriceRow} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#3c2b1a24] bg-white px-2.5 text-[0.7rem] font-extrabold hover:border-[#98620f66]"><Plus className="h-3.5 w-3.5" /> Add price</button>
                </div>
                <div className="grid gap-2">
                  {form.prices.map((price, index) => (
                    <div key={index} className="grid gap-2 rounded-md border border-[#3c2b1a1f] bg-[#fbf6ee] p-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
                      <label className="grid gap-1 text-[0.7rem] font-extrabold">Option name<input value={price.label} onChange={event => updatePriceRow(index, 'label', event.target.value)} placeholder={index === 0 ? 'Standard' : 'Half dozen'} className="pc-input h-10 bg-white" /></label>
                      <label className="grid gap-1 text-[0.7rem] font-extrabold">Amount<input required value={price.amount} onChange={event => updatePriceRow(index, 'amount', event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="10000" className="pc-input h-10 bg-white" /></label>
                      <button type="button" onClick={() => removePriceRow(index)} disabled={form.prices.length === 1} className="grid h-10 w-10 place-items-center self-end rounded-md border border-[#3c2b1a24] bg-white text-[#716255] hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Remove price option"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-xs font-extrabold">Product image</p>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-[#9f8d78] bg-[#fbf6ee] p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#e7dac8]">{imagePreview || form.imageUrl ? <Image src={imagePreview || form.imageUrl} alt="Menu preview" fill className="object-cover" sizes="80px" unoptimized={imagePreview.startsWith('blob:')} /> : <div className="grid h-full place-items-center text-[#8a755f]"><ImagePlus className="h-5 w-5" /></div>}</div>
                  <div className="min-w-0 flex-1"><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} required={!form.imageUrl} className="block w-full text-xs font-semibold file:mr-2 file:rounded-md file:border-0 file:bg-[#1c1712] file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-white" />{imageFile && <p className="mt-1 truncate text-[0.7rem] font-semibold text-[#716255]">{imageFile.name}</p>}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#3c2b1a1f] pt-3 sm:col-span-2">
                <button type="submit" disabled={saving || !form.name || !form.category || !hasValidPrices || (!imageFile && !form.imageUrl)} className="pc-button-primary disabled:cursor-not-allowed disabled:opacity-50">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{saving ? 'Saving...' : form.id ? 'Update item' : 'Add item'}</button>
                {form.id && <button type="button" onClick={resetForm} className="pc-button-secondary">Cancel</button>}
              </div>
            </form>
          </section>

          <section className="min-w-0 rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] shadow-sm">
            <header className="border-b border-[#3c2b1a1f] p-4">
              <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-extrabold">Menu library</h2><p className="mt-1 text-xs font-semibold text-[#716255]">{filteredItems.length} of {items.length} items</p></div></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="relative"><span className="sr-only">Search menu</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a755f]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search items" className="pc-input h-10 pl-9" /></label>
                <select value={filterCategory} onChange={event => setFilterCategory(event.target.value)} className="pc-input h-10 sm:w-44"><option value="All">All categories</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select>
              </div>
            </header>

            <div className="pc-scrollbar max-h-[48rem] overflow-y-auto p-3 sm:p-4">
              {loading ? <div className="flex items-center gap-2 py-8 text-sm font-bold text-[#716255]"><RefreshCw className="h-4 w-4 animate-spin" /> Loading menu...</div> : !filteredItems.length ? <p className="rounded-md border border-[#3c2b1a1f] bg-[#fbf6ee] p-4 text-sm font-semibold text-[#716255]">No items match this filter.</p> : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {filteredItems.map(item => (
                    <li key={item.id} className="flex min-w-0 gap-3 rounded-md border border-[#3c2b1a1f] bg-white p-2.5 hover:border-[#98620f66]">
                      <button type="button" onClick={() => setActiveItem(item)} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#e7dac8]" aria-label={`View ${item.name}`}><Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" /></button>
                      <div className="flex min-w-0 flex-1 flex-col"><p className="truncate text-xs font-extrabold text-[#98620f]">{toTitleCase(item.category)}</p><button type="button" onClick={() => setActiveItem(item)} className="mt-0.5 line-clamp-2 text-left text-sm font-extrabold leading-5">{toTitleCase(item.name)}</button><div className="mt-2 flex flex-wrap gap-1">{item.pricesJson.slice(0, 3).map((price, index) => <span key={`${price.label}-${index}`} className="rounded border border-[#3c2b1a1f] bg-[#fbf6ee] px-1.5 py-1 text-[0.65rem] font-bold text-[#716255]">{toTitleCase(price.label || 'Standard')}: {money(price.amount)}</span>)}</div><div className="mt-auto flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => startEdit(item)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#3c2b1a1f]" aria-label={`Edit ${item.name}`}><Pencil className="h-3.5 w-3.5" /></button></div></div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <Modal open={Boolean(activeItem)} onClose={() => setActiveItem(null)} labelledBy="admin-item-title" className="max-w-lg" align="bottom">
        {activeItem && <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col sm:max-h-[calc(100dvh-3rem)]"><header className="flex items-start justify-between gap-4 border-b border-[#3c2b1a1f] p-4"><div className="min-w-0"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#98620f]">{toTitleCase(activeItem.category)}</p><h2 id="admin-item-title" className="mt-1 break-words text-xl font-extrabold">{toTitleCase(activeItem.name)}</h2></div><button type="button" onClick={() => setActiveItem(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#3c2b1a24]" aria-label="Close item"><X className="h-4 w-4" /></button></header>
          <div className="pc-scrollbar min-h-0 flex-1 overflow-y-auto p-4"><div className="relative aspect-[16/9] overflow-hidden rounded-md bg-[#e7dac8]"><Image src={activeItem.imageUrl} alt={activeItem.name} fill className="object-cover" sizes="512px" /></div>{activeItem.description && <p className="mt-3 text-sm font-semibold leading-6 text-[#716255]">{activeItem.description}</p>}<div className="mt-3 flex flex-wrap gap-2">{activeItem.pricesJson.map((price, index) => <span key={`${price.label}-${index}`} className="rounded-md border border-[#3c2b1a24] bg-[#fbf6ee] px-2.5 py-1.5 text-xs font-extrabold">{toTitleCase(price.label)}: {money(price.amount)}</span>)}</div></div>
          <footer className="flex shrink-0 gap-2 border-t border-[#3c2b1a1f] p-3"><button type="button" onClick={() => startEdit(activeItem)} className="pc-button-primary flex-1"><Pencil className="h-4 w-4" /> Edit item</button><button type="button" onClick={() => handleDelete(activeItem)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button></footer></div>}
      </Modal>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} labelledBy="password-title" className="max-w-md" align="bottom">
        <form onSubmit={handlePasswordChange} className="flex max-h-[calc(100dvh-1.5rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3c2b1a1f] p-4 sm:p-5"><div><div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1c1712] text-[#dcae5d]"><KeyRound className="h-4 w-4" /></div><h2 id="password-title" className="mt-3 text-xl font-extrabold">Change admin password</h2><p className="mt-1 text-xs font-semibold leading-5 text-[#716255]">The old password and every older session stop working immediately.</p></div><button type="button" onClick={() => setPasswordOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#3c2b1a24]" aria-label="Close password dialog"><X className="h-4 w-4" /></button></header>
          <div className="pc-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5"><div className="grid gap-3">{[
            ['Current password', 'currentPassword', 'current-password'],
            ['New password', 'newPassword', 'new-password'],
            ['Confirm new password', 'confirmPassword', 'new-password'],
          ].map(([label, field, autoComplete]) => <label key={field} className="grid gap-1.5 text-xs font-extrabold">{label}<span className="relative"><input type={showPasswords ? 'text' : 'password'} value={passwordForm[field as keyof typeof passwordForm]} onChange={event => setPasswordForm({ ...passwordForm, [field]: event.target.value })} className="pc-input pr-11" minLength={field === 'currentPassword' ? undefined : 10} autoComplete={autoComplete} required />{field === 'currentPassword' && <button type="button" onClick={() => setShowPasswords(value => !value)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#716255] hover:bg-[#eee3d5]" aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}</span></label>)}<p className="text-[0.7rem] font-semibold leading-5 text-[#716255]">Use at least 10 characters. A memorable phrase with mixed letters, a number and a symbol works well.</p>{passwordError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{passwordError}</p>}</div></div>
          <footer className="flex shrink-0 gap-2 border-t border-[#3c2b1a1f] p-3 sm:p-4"><button type="button" onClick={() => setPasswordOpen(false)} className="pc-button-secondary flex-1">Cancel</button><button type="submit" disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword} className="pc-button-primary flex-1 disabled:opacity-50">{passwordSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{passwordSaving ? 'Changing...' : 'Change password'}</button></footer>
        </form>
      </Modal>
    </main>
  );
}
