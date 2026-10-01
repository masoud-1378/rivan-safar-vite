'use client';

import { useMemo, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { fa } from '@/lib/utils';
import { updateSettings } from './actions';
import { SETTINGS_REGISTRY, SETTING_TABS, type SettingDef } from '@/src/lib/settings';

function SettingField({ def, value, onChange, disabled, error }: { def: SettingDef; value: string; onChange: (v: string) => void; disabled: boolean; error?: string }) {
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
      <Field label="" error={error}>
        <Select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} options={def.options} />
      </Field>
    );
  }
  if (def.kind === 'textarea') {
    return (
      <Field label="" error={error}>
        <Textarea value={value} disabled={disabled} dir={def.ltr ? 'ltr' : undefined} onChange={(e) => onChange(e.target.value)} className="min-h-20" />
      </Field>
    );
  }
  return (
    <Field label="" error={error}>
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
  const [baseline, setBaseline] = useState<Record<string, string>>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();

  const visibleTabs = useMemo(() => {
    if (role === 'owner') return SETTING_TABS;
    const allowed = new Set(
      SETTINGS_REGISTRY.filter((d) => !d.ownerOnly).map((d) => d.tab),
    );
    return SETTING_TABS.filter((t) => allowed.has(t.id));
  }, [role]);

  const tabDefs = useMemo(() => {
    const map = new Map<string, SettingDef[]>();
    for (const t of visibleTabs) {
      map.set(
        t.id,
        SETTINGS_REGISTRY.filter((d) => d.tab === t.id && (!d.ownerOnly || role === 'owner')),
      );
    }
    return map;
  }, [visibleTabs, role]);

  const dirtyOf = (tabId: string): SettingDef[] =>
    (tabDefs.get(tabId) ?? []).filter((d) => (values[d.key] ?? d.defaultValue) !== (baseline[d.key] ?? d.defaultValue));

  const handleSaveTab = (tabId: string) => {
    const dirty = dirtyOf(tabId);
    if (dirty.length === 0) return;
    setSavedFlash(false);
    startTransition(async () => {
      const res = await updateSettings(dirty.map((d) => ({ key: d.key, value: values[d.key] ?? d.defaultValue })));
      if (res.saved.length > 0) {
        setBaseline((prev) => {
          const next = { ...prev };
          for (const d of dirty) {
            if (res.saved.includes(d.key)) next[d.key] = values[d.key] ?? d.defaultValue;
          }
          return next;
        });
      }
      setFieldErrors(res.errors);
      if (res.ok) setSavedFlash(true);
    });
  };

  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات سایت</h1>
        <p className="mt-1 text-sm text-muted-foreground">تنظیمات مرکزی که در کل سایت، سئو و پنل استفاده می‌شوند. هر تغییر در گزارش تغییرات ثبت می‌شود.</p>
      </div>
      {savedFlash ? (
        <p className="rounded-sm border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          همهٔ تغییرات ذخیره شد.
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
        {visibleTabs.map((t) => {
          const dirty = dirtyOf(t.id);
          return (
            <TabsContent key={t.id} value={t.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CardTitle>{t.label}</CardTitle>
                      {dirty.length > 0 ? (
                        <Badge variant="brand">{fa(dirty.length)} تغییر ذخیره‌نشده</Badge>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant={dirty.length > 0 ? 'default' : 'secondary'}
                      disabled={pending || dirty.length === 0}
                      onClick={() => handleSaveTab(t.id)}
                    >
                      {dirty.length > 0 ? `ذخیرهٔ ${fa(dirty.length)} تغییر` : 'ذخیرهٔ همهٔ تغییرات'}
                    </Button>
                  </div>
                  <CardDescription>تغییرات هر تب را یک‌جا ذخیره کنید.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {(tabDefs.get(t.id) ?? []).map((d) => (
                    <div key={d.key} className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                      <div>
                        {/* ST1: کلید فقط در tooltip برچسب، نه در نما. */}
                        <p className="text-sm font-semibold" title={`کلید: ${d.key}`}>{d.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{d.hint}</p>
                      </div>
                      <div className="min-w-0">
                        <SettingField
                          def={d}
                          value={values[d.key] ?? d.defaultValue}
                          disabled={pending}
                          error={fieldErrors[d.key]}
                          onChange={(v) => {
                            setValues((prev) => ({ ...prev, [d.key]: v }));
                            setFieldErrors((prev) => {
                              if (!prev[d.key]) return prev;
                              const next = { ...prev };
                              delete next[d.key];
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
