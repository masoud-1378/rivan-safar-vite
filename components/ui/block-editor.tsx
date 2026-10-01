'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fa } from '@/lib/utils';

/**
 * ویرایشگر بلوکی فارسی و reusable — کاربر هرگز JSON نمی‌بیند.
 * قرارداد ذخیره‌سازی دقیقاً همان است که سایت می‌خواند:
 *   بخش      { heading, content }
 *   پرسش     { question, answer }
 *   فاز      { name, date, categories: string[] }
 *   خدمات/نکات  string[]
 * کلیدهای ناشناسِ آیتم‌های قدیمی روی ذخیره حفظ می‌شوند (pass-through)؛
 * `title` قدیمی از همان باز شدن به `heading` تبدیل و حذف می‌شود (normalizeItem).
 */
export type BlockEditorKind = 'section' | 'faq' | 'phase' | 'lines';

const KIND_META: Record<BlockEditorKind, { itemLabel: string; addLabel: string }> = {
  section: { itemLabel: 'بخش', addLabel: 'افزودن بخش' },
  faq: { itemLabel: 'پرسش', addLabel: 'افزودن پرسش' },
  phase: { itemLabel: 'فاز', addLabel: 'افزودن فاز' },
  lines: { itemLabel: 'مورد', addLabel: 'افزودن' },
};

function asRecord(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(str).map((s) => s.trim()).filter(Boolean);
  if (typeof v === 'string') return v.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

/**
 * یافتهٔ ۱۱: نرمال‌سازی واقعی رکورد در حافظهٔ فرم — `title` قدیمی به `heading`
 * تبدیل و حذف می‌شود تا writeItem روی همان بنویسد و `title` کهنه در رکورد نماند.
 * Idempotent است؛ روی رکوردهای سالم هیچ تغییری نمی‌دهد.
 */
export function normalizeItem(kind: BlockEditorKind, raw: unknown): unknown {
  if (kind !== 'section') return raw;
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const r = raw as Record<string, unknown>;
  if (!('title' in r)) return raw;
  const { title, ...rest } = r;
  return { ...rest, heading: str(r.heading ?? title) };
}

/** خوانش نمایشی فیلدها از آیتم خام (با تحمل شکل‌های قدیمی). */
export function readItem(kind: BlockEditorKind, raw: unknown): Record<string, unknown> {
  const r = asRecord(normalizeItem(kind, raw));
  if (kind === 'section') {
    return { heading: str(r.heading), content: str(r.content ?? r.text ?? r.body) };
  }
  if (kind === 'faq') {
    return { question: str(r.question ?? r.q), answer: str(r.answer ?? r.a) };
  }
  if (kind === 'phase') {
    return {
      name: str(r.name ?? r.title),
      date: str(r.date),
      categories: asStringArray(r.categories ?? r.items),
    };
  }
  // lines
  if (typeof raw === 'string') return { text: raw };
  return { text: str(r.text ?? r.label ?? r.title ?? r.name ?? r.value) };
}

/** نوشتن فیلد ویرایش‌شده در آیتم خام با حفظ کلیدهای ناشناس. */
export function writeItem(kind: BlockEditorKind, raw: unknown, patch: Record<string, unknown>): unknown {
  // یافتهٔ ۱۱: pass-through واقعی برای آیتم آبجکتی قدیمیِ lines — کلیدهای
  // اضافه‌اش (غیر از text) موقع ویرایش حفظ می‌شوند.
  if (kind === 'lines') {
    if (typeof raw === 'string') return str(patch.text);
    const r = asRecord(raw);
    return Object.keys(r).length > 0 ? { ...r, text: str(patch.text) } : str(patch.text);
  }
  return { ...asRecord(normalizeItem(kind, raw)), ...patch };
}

function isEmptyItem(kind: BlockEditorKind, raw: unknown): boolean {
  const f = readItem(kind, raw);
  if (kind === 'section') return !str(f.heading).trim() && !str(f.content).trim();
  if (kind === 'faq') return !str(f.question).trim() && !str(f.answer).trim();
  if (kind === 'phase') {
    const cats = f.categories as string[];
    return !str(f.name).trim() && !str(f.date).trim() && cats.length === 0;
  }
  return !str(f.text).trim();
}

/** حذف آیتم‌های کاملاً خالی پیش از ذخیره (همراه با نرمال‌سازی واقعی رکوردها). */
export function cleanBlocks(kind: BlockEditorKind, items: unknown[]): unknown[] {
  return items
    .map((it) => normalizeItem(kind, it))
    .filter((it) => !isEmptyItem(kind, it));
}

/** اولین ایراد فارسی برای نمایش زیر همان فیلد؛ null یعنی معتبر. */
export function validateBlocks(kind: BlockEditorKind, items: unknown[]): string | null {
  for (let i = 0; i < items.length; i++) {
    const f = readItem(kind, items[i]);
    const n = fa(i + 1);
    const label = KIND_META[kind].itemLabel;
    if (kind === 'lines') continue;
    if (kind === 'section' && str(f.content).trim() && !str(f.heading).trim()) {
      return `تیتر ${label} ${n} خالی است.`;
    }
    if (kind === 'faq' && str(f.answer).trim() && !str(f.question).trim()) {
      return `متن ${label} ${n} خالی است.`;
    }
    if (kind === 'phase') {
      const cats = f.categories as string[];
      if ((str(f.date).trim() || cats.length > 0) && !str(f.name).trim()) {
        return `نام ${label} ${n} خالی است.`;
      }
    }
  }
  return null;
}

export interface BlockEditorProps {
  kind: BlockEditorKind;
  /** مقادیر خام (آرایه) — کنترل‌شده از والد. */
  value: unknown[];
  onChange: (next: unknown[]) => void;
  /** برچسب دکمهٔ افزودن؛ پیش‌فرض هر نوع. */
  addLabel?: string;
  /** تیتر بخش (اختیاری). */
  title?: string;
  hint?: string;
  /** خطای سطح فیلد از والد (زیر ویرایشگر نمایش داده می‌شود). */
  error?: string;
}

export default function BlockEditor({ kind, value, onChange, addLabel, title, hint, error }: BlockEditorProps) {
  const baseId = useId().replace(/:/g, '');
  const meta = KIND_META[kind];
  // یافتهٔ ۱۱: حافظهٔ فرم همیشه نرمال است — title قدیمی از همان اول به heading
  // تبدیل شده و دیگر به والد/سرور برنمی‌گردد.
  const items = (Array.isArray(value) ? value : []).map((it) => normalizeItem(kind, it));

  const patch = (index: number, p: Record<string, unknown>) => {
    onChange(items.map((it, i) => (i === index ? writeItem(kind, it, p) : it)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    const blank =
      kind === 'section'
        ? { heading: '', content: '' }
        : kind === 'faq'
          ? { question: '', answer: '' }
          : kind === 'phase'
            ? { name: '', date: '', categories: [] as string[] }
            : '';
    onChange([...items, blank]);
  };

  const renderFields = (raw: unknown, index: number) => {
    const f = readItem(kind, raw);
    const n = fa(index + 1);
    if (kind === 'section') {
      return (
        <>
          <Field label={`تیتر ${meta.itemLabel} ${n}`} htmlFor={`${baseId}-s${index}-h`}>
            <Input
              id={`${baseId}-s${index}-h`}
              value={str(f.heading)}
              onChange={(e) => patch(index, { heading: e.target.value })}
              placeholder="تیتر بخش"
            />
          </Field>
          <Field label="متن" htmlFor={`${baseId}-s${index}-c`}>
            <Textarea
              id={`${baseId}-s${index}-c`}
              value={str(f.content)}
              onChange={(e) => patch(index, { content: e.target.value })}
              className="min-h-24"
              placeholder="متن بخش…"
            />
          </Field>
        </>
      );
    }
    if (kind === 'faq') {
      return (
        <>
          <Field label={`پرسش ${n}`} htmlFor={`${baseId}-f${index}-q`}>
            <Input
              id={`${baseId}-f${index}-q`}
              value={str(f.question)}
              onChange={(e) => patch(index, { question: e.target.value })}
              placeholder="پرسش…"
            />
          </Field>
          <Field label="پاسخ" htmlFor={`${baseId}-f${index}-a`}>
            <Textarea
              id={`${baseId}-f${index}-a`}
              value={str(f.answer)}
              onChange={(e) => patch(index, { answer: e.target.value })}
              className="min-h-24"
              placeholder="پاسخ…"
            />
          </Field>
        </>
      );
    }
    if (kind === 'phase') {
      const cats = f.categories as string[];
      return (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={`نام فاز ${n}`} htmlFor={`${baseId}-p${index}-n`}>
              <Input
                id={`${baseId}-p${index}-n`}
                value={str(f.name)}
                onChange={(e) => patch(index, { name: e.target.value })}
                placeholder="مثلاً فاز ۱"
              />
            </Field>
            <Field label="تاریخ" htmlFor={`${baseId}-p${index}-d`}>
              <Input
                id={`${baseId}-p${index}-d`}
                value={str(f.date)}
                onChange={(e) => patch(index, { date: e.target.value })}
                placeholder="مثلاً ۲۴ تا ۲۸ مهر"
              />
            </Field>
          </div>
          <Field label="دسته‌بندی‌ها" htmlFor={`${baseId}-p${index}-c`} hint="هر دسته‌بندی در یک خط">
            <Textarea
              id={`${baseId}-p${index}-c`}
              value={cats.join('\n')}
              onChange={(e) => patch(index, { categories: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              className="min-h-20"
              placeholder={'الکترونیک و لوازم خانگی\nتجهیزات روشنایی'}
            />
          </Field>
        </>
      );
    }
    return (
      <Field label={`${meta.itemLabel} ${n}`} htmlFor={`${baseId}-l${index}`}>
        <Input
          id={`${baseId}-l${index}`}
          value={str(f.text)}
          onChange={(e) => patch(index, { text: e.target.value })}
          placeholder="بنویسید…"
        />
      </Field>
    );
  };

  return (
    <div className="space-y-3">
      {(title || hint) && (
        <div>
          {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      )}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          هنوز چیزی ثبت نشده است.
        </p>
      ) : null}
      {items.map((raw, index) => {
        const n = fa(index + 1);
        return (
          <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {meta.itemLabel} {n}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                aria-label={`حذف ${meta.itemLabel} ${n}`}
                onClick={() => remove(index)}
              >
                <Trash2 />
                حذف
              </Button>
            </div>
            {renderFields(raw, index)}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={add}>
        <Plus />
        {addLabel ?? meta.addLabel}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
