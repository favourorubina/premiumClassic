'use client';

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

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/menu-items');
      if (!res.ok) {
        throw new Error('Failed to load items');
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
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
        const [label, amountStr] = part.split(':').map(x => x.trim());
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
      pricesText: item.pricesJson.map(p => `${p.label}:${p.amount}`).join(', '),
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const prices = parsePrices(form.pricesText);

    const payload = {
      name: form.name,
      category: form.category,
      imageUrl: form.imageUrl,
      description: form.description,
      prices,
    };

    try {
      const url = form.id ? `/api/menu-items/${form.id}` : '/api/menu-items';
      const method = form.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save item');
      }

      resetForm();
      await loadItems();
    } catch (err) {
      console.error(err);
      setError('Could not save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;

    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      await loadItems();
    } catch (err) {
      console.error(err);
      setError('Could not delete item.');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/sweet-81985/login';
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Premium Classic – Admin
            </h1>
            <p className="text-xs text-neutral-500">
              Manage menu items, prices and images
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/', '_blank')}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              View site
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-neutral-900">
            {form.id ? 'Edit item' : 'Add new item'}
          </h2>
          <p className="mb-4 mt-1 text-xs text-neutral-500">
            Name, category, image and prices will show on the public menu.
          </p>

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
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Cake Parfait"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-neutral-700">
                Image URL
              </label>
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              />
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
                Use format: label:amount, label:amount (e.g. Full cup:5000, Medium:3500)
              </p>
            </div>

            <div className="mt-2 flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={saving || !form.name || !form.category || !form.imageUrl}
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Menu items
            </h2>
            {loading && (
              <span className="text-xs text-neutral-500">Loading…</span>
            )}
          </div>

          {!loading && items.length === 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              No items yet. Add your first Premium Classic treat above.
            </p>
          )}

          {!loading && items.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {toTitleCase(item.name)}
                      </h3>
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                        {toTitleCase(item.category)}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs text-neutral-600">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-medium text-neutral-800">
                        {item.pricesJson
                          .map(p => `${p.label}: #${p.amount}`)
                          .join(' | ')}
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-neutral-300 px-3 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
