'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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
  description?: string | null;
  pricesJson: PriceOption[];
};

const BASE_CATEGORIES = [
  'Parfait',
  'Banana Bread',
  'Pancake',
  'Pastries',
  'Shawarma',
  'Cake Slice',
  'Drinks',
];

const emptyForm = {
  id: '',
  name: '',
  category: '',
  imageUrl: '',
  description: '',
  pricesText: '',
};

export default function AdminDashboard() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/menu-items');
      if (res.status === 401) {
        window.location.href = '/sweet-81985/login';
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load items');
      }
      const data = await res.json();
      setItems(data);
    } catch {
      setError('Could not load items. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function parsePrices(text: string): PriceOption[] {
    return text
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(part => {
        const [rawLabel, amountStr] = part.split(':').map(x => x.trim());
        const label = toTitleCase(rawLabel || '');
        return {
          label,
          amount: Number(amountStr) || 0,
        };
      });
  }

  function startEdit(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || '',
      pricesText: item.pricesJson
        .map(p => `${toTitleCase(p.label)}:${p.amount}`)
        .join(', '),
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) {
      return form.imageUrl;
    }
    const data = new FormData();
    data.append('file', imageFile);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: data,
    });
    if (!res.ok) {
      throw new Error('Image upload failed');
    }
    const json = await res.json();
    return json.url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const imageUrl = await uploadImageIfNeeded();
      const prices = parsePrices(form.pricesText);

      const payload = {
        name: form.name,
        category: form.category,
        imageUrl,
        description: form.description,
        prices,
      };

      const url = form.id ? `/api/menu-items/${form.id}` : '/api/menu-items';
      const method = form.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = '/sweet-81985/login';
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save item');
      }

      resetForm();
      await loadItems();
    } catch {
      setError('Could not save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;

    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        window.location.href = '/sweet-81985/login';
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      setActiveItem(null);
      await loadItems();
    } catch {
      setError('Could not delete item.');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/sweet-81985/login';
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(form.imageUrl);
    }
  }

  const hasImage = !!imagePreview || !!form.imageUrl;

  const categories = Array.from(
    new Set([
      ...BASE_CATEGORIES,
      ...items.map(i => i.category).filter(Boolean),
    ]),
  );

  const filteredItems =
    filterCategory === 'All'
      ? items
      : items.filter(item => item.category === filterCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f2e9] via-[#fbf7ef] to-[#f1e6d6]">
      <header className="border-b border-amber-100/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-amber-600/30 bg-amber-50">
              <Image
                src="/logo.jpg"
                alt="Premium Classic Pastries"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700">
                Premium Classic
              </p>
              <h1 className="text-sm font-semibold text-neutral-900 sm:text-base">
                Admin Manager
              </h1>
              <p className="hidden text-[11px] text-neutral-500 sm:block">
                Manage items, categories, images and prices in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/', '_blank')}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-medium text-neutral-700 shadow-sm hover:bg-neutral-100 sm:inline-flex"
            >
              View site
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-black"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-xs shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Changes here update what customers see on the menu.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="rounded-full bg-neutral-100 px-2 py-1">
              Total items:{' '}
              <span className="font-semibold text-neutral-900">{items.length}</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  {form.id ? 'Edit menu item' : 'Add new menu item'}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Use categories like Parfait, Banana Bread, Pancake, Pastries, Shawarma, Cake
                  Slice or Drinks.
                </p>
              </div>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  New item
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Chocolate Cake Parfait"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Image
                </label>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/70 p-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                    {hasImage ? (
                      <img
                        src={imagePreview || form.imageUrl}
                        alt={form.name || 'Preview'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-black"
                    />
                    {imageFile && (
                      <p className="mt-1 truncate text-[11px] text-neutral-500">
                        {imageFile.name}
                      </p>
                    )}
                    {!imageFile && form.imageUrl && (
                      <p className="mt-1 truncate text-[11px] text-neutral-500">
                        {form.imageUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Description (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Rich chocolate cake parfait layered with creamy frosting."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-neutral-700">
                  Prices
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Full cup:5000, Medium:3500"
                  value={form.pricesText}
                  onChange={e => setForm({ ...form, pricesText: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Use: label:amount, label:amount (Full cup:5000, Medium:3500)
                </p>
              </div>

              <div className="mt-2 flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.name ||
                    !form.category ||
                    !form.pricesText ||
                    (!imageFile && !form.imageUrl)
                  }
                  className="rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-300"
                >
                  {saving ? 'Saving…' : form.id ? 'Update item' : 'Add item'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Menu items
                </h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Tap an item to see details, edit or delete.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <label className="text-neutral-500">Filter:</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="rounded-full border border-neutral-300 bg-white px-2 py-1 text-[11px] text-neutral-800 outline-none hover:border-amber-400"
                >
                  <option value="All">All categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!loading && filteredItems.length === 0 && (
              <p className="mt-4 rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
                No items to show yet. Add your first Premium Classic treat on the left.
              </p>
            )}

            {loading && (
              <p className="mt-4 text-[11px] text-neutral-500">Loading…</p>
            )}

            {!loading && filteredItems.length > 0 && (
              <ul className="mt-4 grid gap-3">
                {filteredItems.map(item => (
                  <li
                    key={item.id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 hover:border-amber-200 hover:bg-white"
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {toTitleCase(item.name)}
                        </h3>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                          {toTitleCase(item.category)}
                        </span>
                      </div>
                      <p className="mt-[2px] line-clamp-1 text-[11px] text-neutral-500">
                        {item.description || 'No description yet.'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {toTitleCase(activeItem.category)}
                </p>
                <h2 className="mt-1 text-base font-semibold text-neutral-900 sm:text-lg">
                  {toTitleCase(activeItem.name)}
                </h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>

            <div className="mb-3 h-40 w-full overflow-hidden rounded-xl bg-neutral-100">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.name}
                className="h-full w-full object-cover"
              />
            </div>

            {activeItem.description && (
              <p className="mb-2 text-xs text-neutral-700">
                {activeItem.description}
              </p>
            )}

            {activeItem.pricesJson && activeItem.pricesJson.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {activeItem.pricesJson.map(price => (
                  <span
                    key={price.label}
                    className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                  >
                    {toTitleCase(price.label)}: ₦{price.amount}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  startEdit(activeItem);
                  setActiveItem(null);
                }}
                className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
              >
                Edit item
              </button>
              <button
                onClick={() => handleDelete(activeItem.id)}
                className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
