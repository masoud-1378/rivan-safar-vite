'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { updateSetting } from './actions';

const SETTINGS = [{ key: 'site.url', label: 'دامنه اصلی سایت', type: 'url' }, { key: 'business.phone', label: 'شماره تلفن', type: 'text' }, { key: 'business.email', label: 'ایمیل', type: 'email' }, { key: 'business.address', label: 'نشانی دفتر', type: 'text' }, { key: 'business.workingHours', label: 'ساعات پاسخگویی', type: 'text' }, { key: 'seo.indexing_enabled', label: 'ایندکس‌گذاری فعال', type: 'boolean' }];

export default function SettingsPage({ initial }: { initial: Awaited<ReturnType<typeof import('./actions').getSettings>> }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(initial.map((s) => [s.settingKey, s.settingValue])));
  const [pending, startTransition] = useTransition();
  const handleSubmit = (key: string) => { startTransition(async () => { try { await updateSetting(key, values[key] || ''); alert('ذخیره شد.'); } catch { alert('خطا در ذخیره.'); } }); };
  return <div className="admin-enter space-y-6"><div><h1 className="text-2xl font-semibold">تنظیمات سایت</h1><p className="mt-1 text-sm text-muted-foreground">تنظیمات مرکزی که در کل سایت و سئو استفاده می‌شوند.</p></div><Card><CardHeader><CardTitle>تنظیمات مرکزی</CardTitle><CardDescription>مقدار هر گزینه را ویرایش و جداگانه ذخیره کنید.</CardDescription></CardHeader><CardContent className="space-y-5">{SETTINGS.map((s) => <div key={s.key} className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2"><div><p className="text-sm font-semibold">{s.label}</p><p className="mt-1 text-xs text-muted-foreground">کلید: <code className="font-mono">{s.key}</code></p></div><div className="flex items-center gap-3">{s.type === 'boolean' ? <label className="flex cursor-pointer items-center gap-2 text-sm"><Input type="checkbox" checked={values[s.key] === 'true'} onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.checked ? 'true' : 'false' }))} className="size-4" />فعال</label> : <Field label=""><Input type={s.type} value={values[s.key] || ''} onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))} /></Field>}<Button type="button" variant="secondary" disabled={pending} onClick={() => handleSubmit(s.key)}>ذخیره</Button></div></div>)}</CardContent></Card></div>;
}
