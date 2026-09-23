'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { updateSetting } from './actions';
import { SETTINGS_REGISTRY, SETTING_TABS, type SettingDef } from '@/src/lib/settings';

function SettingField({ def, value, onChange, disabled }: { def: SettingDef; value: string; onChange: (v: string) => void; disabled: boolean }) {
  if (def.kind === 'boolean') {
    return (
      <div className="flex items-center gap-2.5">
        <Switch
          checked={value === 'true'}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
          aria-label={def.label}
        />
        <span className="text-sm">{value === 'true' ? 'فعال' : 'غیرفعال'}</span>
      </div>
    );
  }
  if (def.kind === 'select' && def.options) {
    return (
      <Field label="">
        <Select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} options={def.options} />
      </Field>
    );
  }
  if (def.kind === 'textarea') {
    return (
      <Field label="">
        <Textarea value={value} disabled={disabled} dir={def.ltr ? 'ltr' : undefined} onChange={(e) => onChange(e.target.value)} className="min-h-20" />
      </Field>
    );
  }
  return (
    <Field label="">
      <Input
        type={def.kind === 'number' ? 'number' : def.kind === 'email' ? 'email' : def.kind === 'url' ? 'url' : 'text'}
        value={value}
        disabled={disabled}
        dir={def.ltr ? 'ltr' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export default function SettingsPage({ initial, role }: { initial: Record<string, string>; role: 'owner' | 'editor' }) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [savedTick, setSavedTick] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const visibleTabs = useMemo(() => {
    if (role === 'owner') return SETTING_TABS;
    const allowed = new Set(
      SETTINGS_REGISTRY.filter((d) => !d.ownerOnly).map((d) => d.tab),
    );
    return SETTING_TABS.filter((t) => allowed.has(t.id));
  }, [role]);

  const handleSubmit = (key: string) => {
    setError('');
    startTransition(async () => {
      try {
        await updateSetting(key, values[key] ?? '');
        setSavedTick((t) => t + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطا در ذخیره.');
      }
    });
  };

  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات سایت</h1>
        <p className="mt-1 text-sm text-muted-foreground">تنظیمات مرکزی که در کل سایت، سئو و پنل استفاده می‌شوند. هر تغییر در گزارش تغییرات ثبت می‌شود.</p>
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {savedTick > 0 && !error ? (
        <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          ذخیره شد.
        </p>
      ) : null}
      <Tabs defaultValue="general" variant="segmented">
        <TabsList aria-label="بخش‌های تنظیمات">
          {visibleTabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {visibleTabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <Card>
              <CardHeader>
                <CardTitle>{t.label}</CardTitle>
                <CardDescription>مقدار هر گزینه را ویرایش و جداگانه ذخیره کنید.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {SETTINGS_REGISTRY.filter((d) => d.tab === t.id && (!d.ownerOnly || role === 'owner')).map((d) => (
                  <div key={d.key} className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold">{d.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{d.hint}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        کلید: <code className="font-mono">{d.key}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <SettingField def={d} value={values[d.key] ?? d.defaultValue} disabled={pending} onChange={(v) => setValues((prev) => ({ ...prev, [d.key]: v }))} />
                      </div>
                      <Button type="button" variant="secondary" disabled={pending} onClick={() => handleSubmit(d.key)}>
                        ذخیره
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}