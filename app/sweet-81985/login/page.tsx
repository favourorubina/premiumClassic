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
    <main className="flex min-h-screen items-center justify-center bg-[#f4eadb] px-4 text-[#17120d]">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#3c2b1a24] bg-[#fffdf8] shadow-2xl">
        <div className="bg-[#130f0b] px-7 py-7 text-center text-[#fff8eb]">
          <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-[#e4b969] bg-[#fffaf3]">
            <Image
              src="/logo.jpg"
              alt="Premium Classic Pastries"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[#e4b969]">
            Premium Classic
          </p>
          <h1 className="mt-2 text-xl font-extrabold text-white">Admin Sign In</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#d8c7ab]">
            Private area for the Premium Classic team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-7 py-7">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
              Username
            </label>
            <input
              type="text"
              value="Premium Classic Admin"
              readOnly
              className="w-full rounded-xl border border-[#9f8d78] bg-[#f4eadb] px-3 py-2.5 text-sm font-bold text-[#17120d] outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-[#2d241b]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#9f8d78] bg-white px-3 py-2.5 text-sm font-semibold text-[#17120d] outline-none placeholder:text-[#7f705f] focus:border-[#98620f] focus:ring-2 focus:ring-[#c88a2d33]"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full items-center justify-center rounded-xl bg-[#130f0b] px-3 py-3 text-sm font-extrabold text-white hover:bg-[#2a2017] disabled:cursor-not-allowed disabled:bg-[#b9a995]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
