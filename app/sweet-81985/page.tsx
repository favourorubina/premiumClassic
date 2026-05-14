'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  'Cake',
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || 'Failed to save item');
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save item. Please try again.');
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
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || 'Failed to delete');
      }
      setActiveItem(null);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item.');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/sweet-81985/login';
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setImageFile(null);
      setImagePreview(form.imageUrl);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
    e.target.value = '';
  }

  const hasImage = !!imagePreview || !!form.imageUrl;

  const categories = Array.from(
    new Set([...BASE_CATEGORIES, ...items.map(i => i.category).filter(Boolean)]),
  );

  const filteredItems =
    filterCategory === 'All'
      ? items
      : items.filter(item => item.category === filterCategory);

  return (
    <main className="min-h-screen bg-[#f4eadb] text-[#17120d]">
      <header className="border-b border-[#3c2b1a] bg-[#130f0b] text-[#fff8eb] shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#e4b969] bg-[#fffaf3]">
              <Image
                src="/logo.jpg"
                alt="Premium Classic Pastries"
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#e4b969]">
                Premium Classic
              </p>
              <h1 className="text-lg font-extrabold text-white sm:text-xl">
                Admin Manager
              </h1>
              <p className="hidden text-sm font-semibold text-[#d8c7ab] sm:block">
                Manage items, categories, images and prices in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/', '_blank')}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-white/20 sm:inline-flex"
            >
              View site
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#e4b969] px-4 py-2 text-xs font-extrabold text-[#130f0b] hover:bg-[#f2c977]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#3c2b1a24] bg-[#fffaf3] px-4 py-3 text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#130f0b] px-3 py-1.5 text-[11px] font-extrabold text-[#fff8eb]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e4b969]" />
              Changes here update what customers see on the menu.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#4b4037]">
            <span className="rounded-full border border-[#3c2b1a24] bg-white px-3 py-1">
              Total items:{' '}
              <span className="font-extrabold text-[#17120d]">{items.length}</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:items-start">
          <section className="rounded-2xl border border-[#3c2b1a24] bg-[#fffdf8] p-4 shadow-md sm:p-5 lg:sticky lg:top-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#17120d]">
                  {form.id ? 'Edit menu item' : 'Add new menu item'}
                </h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#5a4a3b]">
                  Use categories like Parfait, Banana Bread, Pancake, Pastries, Shawarma, Cake
                  Slice, Cake or Drinks.
                </p>
              </div>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#3c2b1a33] bg-white px-3 py-1 text-[11px] font-extrabold text-[#17120d] hover:bg-[#f4eadb]"
                >
                  New item
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-[#9f8d78] bg-white px-3 py-2 text-sm font-semibold text-[#17120d] outline-none placeholder:text-[#7f705f] focus:border-[#98620f] focus:ring-2 focus:ring-[#c88a2d33]"
                  placeholder="Chocolate Cake Parfait"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-[#9f8d78] bg-white px-3 py-2 text-sm font-semibold text-[#17120d] outline-none focus:border-[#98620f] focus:ring-2 focus:ring-[#c88a2d33]"
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
                <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
                  Image
                </label>
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[#9f8d78] bg-[#fff8eb] p-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#e8ddce]">
                    {hasImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview || form.imageUrl}
                          alt={form.name || 'Preview'}
                          className="h-full w-full object-cover"
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[#5a4a3b]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs font-semibold text-[#2d241b] file:mr-2 file:rounded-md file:border-0 file:bg-[#130f0b] file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-white hover:file:bg-black"
                    />
                    {imageFile && (
                      <p className="mt-1 truncate text-[11px] font-semibold text-[#5a4a3b]">
                        {imageFile.name}
                      </p>
                    )}
                    {!imageFile && form.imageUrl && (
                      <p className="mt-1 truncate text-[11px] font-semibold text-[#5a4a3b]">
                        Current image: {form.imageUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
                  Description (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-[#9f8d78] bg-white px-3 py-2 text-sm font-semibold text-[#17120d] outline-none placeholder:text-[#7f705f] focus:border-[#98620f] focus:ring-2 focus:ring-[#c88a2d33]"
                  placeholder="Rich chocolate cake parfait layered with creamy frosting."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
                  Prices
                </label>
                <input
                  className="w-full rounded-lg border border-[#9f8d78] bg-white px-3 py-2 text-sm font-semibold text-[#17120d] outline-none placeholder:text-[#7f705f] focus:border-[#98620f] focus:ring-2 focus:ring-[#c88a2d33]"
                  placeholder="Full cup:5000, Medium:3500"
                  value={form.pricesText}
                  onChange={e => setForm({ ...form, pricesText: e.target.value })}
                />
                <p className="mt-1 text-[11px] font-semibold text-[#5a4a3b]">
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
                  className="rounded-lg bg-[#130f0b] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#2a2017] disabled:cursor-not-allowed disabled:bg-[#b9a995]"
                >
                  {saving ? 'Saving...' : form.id ? 'Update item' : 'Add item'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-[#3c2b1a33] bg-white px-4 py-2.5 text-xs font-extrabold text-[#17120d] hover:bg-[#f4eadb]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-[#3c2b1a24] bg-[#fffdf8] p-4 shadow-md sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#17120d]">Menu items</h2>
                <p className="mt-1 text-[11px] font-semibold text-[#5a4a3b]">
                  Tap an item to see details, edit or delete.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <label className="text-[#4b4037]">Filter:</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="rounded-full border border-[#9f8d78] bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#17120d] outline-none hover:border-[#98620f]"
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
              <p className="mt-4 rounded-lg border border-[#3c2b1a24] bg-[#fff8eb] px-3 py-3 text-xs font-semibold text-[#5a4a3b]">
                No items to show yet. Add your first Premium Classic treat on the left.
              </p>
            )}

            {loading && <p className="mt-4 text-[11px] font-bold text-[#5a4a3b]">Loading...</p>}

            {!loading && filteredItems.length > 0 && (
              <ul className="mt-4 grid gap-3">
                {filteredItems.map(item => (
                  <li
                    key={item.id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-[#3c2b1a24] bg-white p-3 shadow-sm hover:border-[#98620f66] hover:bg-[#fff8eb]"
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#e8ddce]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-[#17120d]">
                          {toTitleCase(item.name)}
                        </h3>
                        <span className="rounded-full bg-[#130f0b] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#fff8eb]">
                          {toTitleCase(item.category)}
                        </span>
                      </div>
                      <p className="mt-[2px] line-clamp-1 text-[11px] font-semibold text-[#5a4a3b]">
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
          <div className="w-full max-w-md rounded-2xl border border-[#3c2b1a24] bg-[#fffdf8] p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#98620f]">
                  {toTitleCase(activeItem.category)}
                </p>
                <h2 className="mt-1 text-base font-extrabold text-[#17120d] sm:text-lg">
                  {toTitleCase(activeItem.name)}
                </h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="rounded-full border border-[#3c2b1a33] bg-white px-3 py-1 text-[11px] font-extrabold text-[#17120d] hover:bg-[#f4eadb]"
              >
                Close
              </button>
            </div>

            <div className="mb-3 h-40 w-full overflow-hidden rounded-xl bg-[#e8ddce]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.imageUrl}
                alt={activeItem.name}
                className="h-full w-full object-cover"
              />
            </div>

            {activeItem.description && (
              <p className="mb-2 text-xs font-semibold text-[#4b4037]">{activeItem.description}</p>
            )}

            {activeItem.pricesJson && activeItem.pricesJson.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {activeItem.pricesJson.map(price => (
                  <span
                    key={price.label}
                    className="inline-flex items-center rounded-full bg-[#130f0b] px-2.5 py-1 text-[11px] font-extrabold text-[#fff8eb]"
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
                className="flex-1 rounded-lg bg-[#130f0b] px-3 py-2.5 text-xs font-extrabold text-white hover:bg-black"
              >
                Edit item
              </button>
              <button
                onClick={() => handleDelete(activeItem.id)}
                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-extrabold text-red-800 hover:bg-red-100"
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
