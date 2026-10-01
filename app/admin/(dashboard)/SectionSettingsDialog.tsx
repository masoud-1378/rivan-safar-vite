'use client';

import { useState, useTransition } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { updateSettings } from './settings/actions';
import { SETTINGS_REGISTRY, type SettingTab } from '@/src/lib/settings';

export default function SectionSettingsDialog({
  sectionKey,
  title,
  tabs,
  values,
}: {
  sectionKey: string;
  title: string;
  tabs: SettingTab[];
  values: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(values);
  const [baseline, setBaseline] = useState(values);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const defs = SETTINGS_REGISTRY.filter((d) => tabs.includes(d.tab) && d.key.startsWith(sectionKey + '.'));

  const dirtyKeys = defs
    .map((d) => d.key)
    .filter((key) => (local[key] ?? defs.find((d) => d.key === key)!.defaultValue) !== (baseline[key] ?? defs.find((d) => d.key === key)!.defaultValue));

  // F3: ذخیرهٔ دسته‌ای (ST2) — یک دکمهٔ «ذخیرهٔ همهٔ تغییرات»، بدون ذخیرهٔ تکی.
  const saveAll = () => {
    if (dirtyKeys.length === 0 || pending) return;
    startTransition(async () => {
      const res = await updateSettings(
        dirtyKeys.map((key) => ({ key, value: local[key] ?? defs.find((d) => d.key === key)!.defaultValue })),
      );
      if (res.saved.length > 0) {
        setBaseline((prev) => {
          const next = { ...prev };
          for (const key of res.saved) next[key] = local[key] ?? '';
          return next;
        });
      }
      setFieldErrors(res.errors);
    });
  };

  const openDialog = () => {
    setLocal(values);
    setBaseline(values);
    setFieldErrors({});
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={openDialog}
      >
        <Settings2 />
        تنظیمات این بخش
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="این تنظیمات فقط همین بخش را کنترل می‌کنند."
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              بستن
            </Button>
            <Button onClick={saveAll} disabled={pending || dirtyKeys.length === 0}>
              {pending ? 'در حال ذخیره…' : 'ذخیرهٔ همهٔ تغییرات'}
            </Button>
          </div>
        }
        className="max-w-lg"
      >
        <div className="max-h-[60vh] space-y-5 overflow-y-auto">
          {defs.length === 0 ? (
            <p className="text-sm text-muted-foreground">تنظیمی برای این بخش تعریف نشده است.</p>
          ) : (
            defs.map((d) => (
              <div key={d.key}>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.hint}</p>
                <div className="mt-2">
                  {d.kind === 'boolean' ? (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Switch
                        checked={(local[d.key] ?? d.defaultValue) === 'true'}
                        disabled={pending}
                        onCheckedChange={(checked) => {
                          setLocal((p) => ({ ...p, [d.key]: checked ? 'true' : 'false' }));
                          setFieldErrors((p) => { const n = { ...p }; delete n[d.key]; return n; });
                        }}
                        aria-label={d.label}
                      />
                      <span>{(local[d.key] ?? d.defaultValue) === 'true' ? 'فعال' : 'غیرفعال'}</span>
                    </div>
                  ) : d.kind === 'select' && d.options ? (
                    <Field error={fieldErrors[d.key]}>
                      <Select
                        value={local[d.key] ?? d.defaultValue}
                        disabled={pending}
                        onChange={(e) => {
                          setLocal((p) => ({ ...p, [d.key]: e.target.value }));
                          setFieldErrors((p) => { const n = { ...p }; delete n[d.key]; return n; });
                        }}
                        options={d.options}
                      />
                    </Field>
                  ) : d.kind === 'textarea' ? (
                    <Field error={fieldErrors[d.key]}>
                      <Textarea
                        value={local[d.key] ?? d.defaultValue}
                        disabled={pending}
                        onChange={(e) => {
                          setLocal((p) => ({ ...p, [d.key]: e.target.value }));
                          setFieldErrors((p) => { const n = { ...p }; delete n[d.key]; return n; });
                        }}
                        className="min-h-20"
                      />
                    </Field>
                  ) : (
                    <Field error={fieldErrors[d.key]}>
                      <Input
                        type={d.kind === 'number' ? 'number' : 'text'}
                        value={local[d.key] ?? d.defaultValue}
                        disabled={pending}
                        dir={d.ltr ? 'ltr' : undefined}
                        onChange={(e) => {
                          setLocal((p) => ({ ...p, [d.key]: e.target.value }));
                          setFieldErrors((p) => { const n = { ...p }; delete n[d.key]; return n; });
                        }}
                      />
                    </Field>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Dialog>
    </>
  );
}