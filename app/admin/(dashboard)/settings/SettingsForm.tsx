'use client';

import { useState, useTransition } from 'react';
import { updateSetting, getSettings } from './actions';

const SETTINGS = [
  { key: 'site.url', label: 'دامنه اصلی سایت', type: 'url' },
  { key: 'business.phone', label: 'شماره تلفن', type: 'text' },
  { key: 'business.email', label: 'ایمیل', type: 'email' },
  { key: 'business.address', label: 'نشانی دفتر', type: 'text' },
  { key: 'business.workingHours', label: 'ساعات پاسخگویی', type: 'text' },
  { key: 'seo.indexing_enabled', label: 'ایندکس‌گذاری فعال', type: 'boolean' },
];

export default function SettingsPage({ initial }: { initial: Awaited<ReturnType<typeof import('./actions').getSettings>> }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map(s => [s.settingKey, s.settingValue]))
  );
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (key: string) => {
    startTransition(async () => {
      try {
        await updateSetting(key, values[key]);
        alert('ذخیره شد.');
      } catch {
        alert('خطا در ذخیره.');
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h2 font-bold text-text-heading">تنظیمات سایت</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          تنظیمات مرکزی که در کل سایت و سئو استفاده می‌شوند.
        </p>
      </div>
      <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4">
        {SETTINGS.map(s => (
          <div key={s.key} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-caption font-bold text-text-heading mb-1">
                {s.label}
              </label>
              <p className="text-caption text-text-secondary text-right">
                کلید: <code className="text-body-sm font-mono text-brand-orange">{s.key}</code>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {s.type === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={values[s.key] === 'true'}
                    onChange={e => setValues(prev => ({ ...prev, [s.key]: e.target.checked ? 'true' : 'false' }))}
                    className="form-checkbox"
                  />
                  <span className="text-body-sm text-text-secondary">فعال</span>
                </label>
              ) : (
                <input
                  type={s.type}
                  value={values[s.key] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                  className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
                />
              )}
              <button
                type="button"
                onClick={() => updateSetting(s.key, values[s.key] || '')}
                className="btn btn-medium btn-secondary text-btn font-bold shrink-0"
              >
                ذخیره
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}