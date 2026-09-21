'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { createClient } from '@/src/lib/supabase-client';

export default function AdminLoginForm() {
  const router = useRouter(); const searchParams = useSearchParams(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setError(''); if (!email.trim() || !password) { setError('ایمیل و رمز عبور را وارد کنید.'); return; } setLoading(true); try { const supabase = createClient(); const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (signInError) { setError(signInError.message === 'Invalid login credentials' ? 'ایمیل یا رمز عبور اشتباه است.' : 'ورود ناموفق بود. دوباره تلاش کنید.'); return; } window.location.assign(searchParams.get('next') || '/admin'); } finally { setLoading(false); } };
  return <div className="admin-vibefarsi flex min-h-screen items-center justify-center bg-background px-4" dir="rtl"><Card className="w-full max-w-sm"><CardHeader className="text-center"><CardTitle className="text-xl">ورود به پنل مدیریت</CardTitle><CardDescription>ریوان سفر — فقط مدیران</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4">{error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}<Field label="ایمیل" htmlFor="admin-email"><Input id="admin-email" type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label="رمز عبور" htmlFor="admin-password"><Input id="admin-password" type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field><Button type="submit" disabled={loading} className="w-full">{loading ? 'در حال ورود...' : 'ورود'}</Button></form></CardContent></Card></div>;
}
