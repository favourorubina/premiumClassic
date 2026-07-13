'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';

const ADMIN_TAB_SESSION_KEY = 'premiumClassic.adminTabSession';

function hasAdminTabSession() {
  try {
    return sessionStorage.getItem(ADMIN_TAB_SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasAdminTabSession()) {
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
      return;
    }

    fetch('/api/admin/session').then(response => {
      if (response.ok) router.replace('/bima/admin');
    }).catch(() => undefined);
  }, [router]);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError('That password is not correct. Please try again.');
        return;
      }
      try {
        sessionStorage.setItem(ADMIN_TAB_SESSION_KEY, 'active');
      } catch {
        setError('Could not start this admin session. Please try again.');
        return;
      }
      router.replace('/bima/admin');
    } catch {
      setError('Could not sign in. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f1e6d7] text-[#1c1712] lg:grid-cols-[minmax(20rem,0.78fr)_1.22fr]">
      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-md border border-[#3c2b1a24] bg-white"><Image src="/logo.jpg" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority /></span>
            <div><p className="text-sm font-extrabold">Premium Classic</p><p className="text-xs font-semibold text-[#716255]">Bakery administration</p></div>
          </div>

          <div className="rounded-lg border border-[#3c2b1a24] bg-[#fffdf8] p-5 shadow-[0_16px_50px_rgba(49,32,14,0.12)] sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1c1712] text-[#dcae5d]"><LockKeyhole className="h-5 w-5" /></div>
            <h1 className="mt-4 text-2xl font-extrabold">Admin sign in</h1>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-[#716255]">Use the current bakery admin password. You can replace the initial password after signing in.</p>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-xs font-extrabold">Account<input type="text" value="Premium Classic Admin" readOnly className="pc-input bg-[#f2eadf] text-[#51463c]" /></label>
              <label className="grid gap-1.5 text-xs font-extrabold">
                Password
                <span className="relative block">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter admin password" value={password} onChange={event => setPassword(event.target.value)} className="pc-input pr-11" autoComplete="current-password" autoFocus />
                  <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#716255] hover:bg-[#eee3d5]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
              </label>
              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">{error}</p>}
              <button type="submit" disabled={loading || !password} className="pc-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"><LogIn className="h-4 w-4" /> {loading ? 'Signing in...' : 'Sign in'}</button>
            </form>
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-[#7b6b5b]">Private access for the Premium Classic team.</p>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden bg-[#21170f] lg:block">
        <Image src="/menu/1 chocolate cake parfait - 5000 full cup, 3500 medium cup.jpeg" alt="Premium Classic chocolate cake parfait" fill className="object-cover" sizes="55vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-[#15100c]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 max-w-xl p-10 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#efc979]">Premium Classic Pastries</p><p className="font-display mt-2 text-4xl font-semibold leading-tight">A calmer workspace for a busy bakery menu.</p></div>
      </section>
    </main>
  );
}
