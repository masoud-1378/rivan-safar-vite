'use client';

import { useState, useTransition } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateSetting } from './settings/actions';
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
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const defs = SETTINGS_REGISTRY.filter((d) => tabs.includes(d.tab) && d.key.startsWith(sectionKey + '.'));

  const save = (key: string) => {
    setError('');
    startTransition(async () => {
      try {
        await updateSetting(key, local[key] ?? '');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطا در ذخیره.');
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setLocal(values);
          setOpen(true);
        }}
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
          <Button variant="ghost" onClick={() => setOpen(false)}>
            بستن
          </Button>
        }
        className="max-w-lg"
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {defs.length === 0 ? (
            <p className="text-sm text-muted-foreground">تنظیمی برای این بخش تعریف نشده است.</p>
          ) : (
            defs.map((d) => (
              <div key={d.key} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.hint}</p>
                  <div className="mt-2">
                    {d.kind === 'boolean' ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Input
                          type="checkbox"
                          checked={(local[d.key] ?? d.defaultValue) === 'true'}
                          disabled={pending}
                          onChange={(e) => setLocal((p) => ({ ...p, [d.key]: e.target.checked ? 'true' : 'false' }))}
                          className="size-4"
                        />
                        {local[d.key] === 'true' ? 'فعال' : 'غیرفعال'}
                      </label>
                    ) : d.kind === 'select' && d.options ? (
                      <Select
                        value={local[d.key] ?? d.defaultValue}
                        disabled={pending}
                        onChange={(e) => setLocal((p) => ({ ...p, [d.key]: e.target.value }))}
                        options={d.options}
                      />
                    ) : d.kind === 'textarea' ? (
                      <Field label="">
                        <Textarea
                          value={local[d.key] ?? d.defaultValue}
                          disabled={pending}
                          onChange={(e) => setLocal((p) => ({ ...p, [d.key]: e.target.value }))}
                          className="min-h-20"
                        />
                      </Field>
                    ) : (
                      <Field label="">
                        <Input
                          type={d.kind === 'number' ? 'number' : 'text'}
                          value={local[d.key] ?? d.defaultValue}
                          disabled={pending}
                          dir={d.ltr ? 'ltr' : undefined}
                          onChange={(e) => setLocal((p) => ({ ...p, [d.key]: e.target.value }))}
                        />
                      </Field>
                    )}
                  </div>
                </div>
                <Button type="button" variant="secondary" disabled={pending} onClick={() => save(d.key)}>
                  ذخیره
                </Button>
              </div>
            ))
          )}
        </div>
      </Dialog>
    </>
  );
}