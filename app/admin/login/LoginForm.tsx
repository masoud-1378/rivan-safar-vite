'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/src/lib/supabase-client';

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // Rate-limit ساده سمت کلاینت (مکمل محدودیت سرور)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'ایمیل یا رمز عبور اشتباه است.'
            : 'ورود ناموفق بود. دوباره تلاش کنید.',
        );
        return;
      }
      router.push(searchParams.get('next') || '/admin');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center px-4" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface-primary border border-border-default rounded-card shadow-card p-6 space-y-4"
      >
        <div className="text-center">
          <h1 className="text-h3 font-bold text-text-heading">ورود به پنل مدیریت</h1>
          <p className="text-body-sm text-text-secondary mt-1">ریوان سفر — فقط مدیران</p>
        </div>
        {error ? (
          <p role="alert" className="text-body-sm text-red-700 bg-red-50 border border-red-200 rounded-control px-3 py-2">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="admin-email" className="block text-caption font-bold text-text-heading mb-1">
            ایمیل
          </label>
          <input
            id="admin-email"
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-left focus:border-brand-orange focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-caption font-bold text-text-heading mb-1">
            رمز عبور
          </label>
          <input
            id="admin-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-left focus:border-brand-orange focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-medium btn-primary w-full text-btn font-bold"
        >
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  );
}
