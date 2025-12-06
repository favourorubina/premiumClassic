'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }

      router.push('/sweet-81985');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f7f2e9] via-[#fbf7ef] to-[#f1e6d6] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/95 p-7 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 h-16 w-16 overflow-hidden rounded-full border border-amber-700/40 bg-amber-50">
            <Image
              src="/logo.jpg"
              alt="Premium Classic Pastries"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-700">
            Premium Classic
          </p>
          <h1 className="mt-1 text-lg font-semibold text-neutral-900">
            Admin Sign In
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Private area for Premium Classic Pastries team only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Username
            </label>
            <input
              type="text"
              value="Premium Classic Admin"
              readOnly
              className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-200"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-neutral-400">
          Protected dashboard · Premium Classic Pastries
        </p>
      </div>
    </main>
  );
}
