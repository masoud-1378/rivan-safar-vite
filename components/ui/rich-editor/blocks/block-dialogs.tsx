'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Plus, Trash2, X, ChevronUp, ChevronDown, ImagePlus, Loader2,
} from 'lucide-react';
import { openMediaPicker } from '@/components/ui/media-library/openMediaPicker';
import { searchToursForPicker } from './tour-search';
import { formatFaPrice } from './format';
import type {
  TourPickerHit, PriceTableAttrs, FaqBlockAttrs, PhotoGalleryAttrs, CallCtaAttrs,
} from './types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function DialogFooter({
  onCancel, onConfirm, confirmLabel, disabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  disabled?: boolean;
}) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>
        انصراف
      </Button>
      <Button onClick={onConfirm} disabled={disabled}>
        {confirmLabel}
      </Button>
    </>
  );
}

/* ————————————————— انتخاب تور ————————————————— */

export function TourPickerDialog({
  open,
  onOpenChange,
  initialSlug,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialSlug?: string;
  onConfirm: (hit: TourPickerHit) => void;
}) {
  const [term, setTerm] = React.useState('');
  const [hits, setHits] = React.useState<TourPickerHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<TourPickerHit | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setTerm('');
    setSelected(null);
    setLoading(true);
    searchToursForPicker('')
      .then((rows) => {
        setHits(rows);
        if (initialSlug) {
          const cur = rows.find((r) => r.slug === initialSlug) ?? null;
          setSelected(cur);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => {
      searchToursForPicker(term).then(setHits).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [term, open ]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="انتخاب تور"
      description="تور را جست‌وجو کنید؛ در متن، کارت تور نشان داده می‌شود."
      footer={
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() => selected && onConfirm(selected)}
          confirmLabel="درج کارت تور"
          disabled={!selected}
        />
      }
    >
      <div className="space-y-3" dir="rtl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="نام تور یا نامک…"
            className="pr-9"
          />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-1">
          {loading && (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال جست‌وجو…
            </p>
          )}
          {!loading && hits.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">توری پیدا نشد.</p>
          )}
          {hits.map((h) => {
            const active = selected?.slug === h.slug;
            const price = formatFaPrice(h.price);
            return (
              <button
                key={h.slug}
                type="button"
                onClick={() => setSelected(h)}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-right text-sm transition-colors ${
                  active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{h.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[h.destination, h.duration, h.statusLabel].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {price && <span className="shrink-0 text-xs font-bold text-primary">{price}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}

/* ————————————————— جدول قیمت ————————————————— */

export function PriceTableDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PriceTableAttrs;
  onConfirm: (attrs: PriceTableAttrs) => void;
}) {
  const [title, setTitle] = React.useState(initial.title ?? '');
  const [rows, setRows] = React.useState(initial.rows);

  React.useEffect(() => {
    if (open) {
      setTitle(initial.title ?? '');
      setRows(initial.rows.length ? initial.rows : [{ label: '', price: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const setRow = (i: number, patch: Partial<{ label: string; price: string }>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="جدول قیمت"
      description="هر ردیف یک عنوان و قیمت دارد؛ مثلاً «اتاق دو تخته» و «۱۲٬۵۰۰٬۰۰۰ تومان»."
      footer={
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() =>
            onConfirm({
              title: title.trim() || null,
              rows: rows
                .map((r) => ({ label: r.label.trim(), price: r.price.trim() }))
                .filter((r) => r.label || r.price),
            })
          }
          confirmLabel="درج جدول قیمت"
          disabled={!rows.some((r) => r.label.trim() || r.price.trim())}
        />
      }
    >
      <div className="space-y-4" dir="rtl">
        <Field label="عنوان جدول (اختیاری)">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً قیمت تور استانبول" />
        </Field>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={r.label}
                onChange={(e) => setRow(i, { label: e.target.value })}
                placeholder="عنوان ردیف"
                className="flex-1"
              />
              <Input
                value={r.price}
                onChange={(e) => setRow(i, { price: e.target.value })}
                placeholder="قیمت"
                className="w-40"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                aria-label="حذف ردیف"
                disabled={rows.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { label: '', price: '' }])}>
            <Plus className="h-4 w-4" />
            افزودن ردیف
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ————————————————— پرسش‌وپاسخ ————————————————— */

export function FaqDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FaqBlockAttrs;
  onConfirm: (attrs: FaqBlockAttrs) => void;
}) {
  const [title, setTitle] = React.useState(initial.title ?? '');
  const [items, setItems] = React.useState(initial.items);

  React.useEffect(() => {
    if (open) {
      setTitle(initial.title ?? '');
      setItems(initial.items.length ? initial.items : [{ question: '', answer: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const setItem = (i: number, patch: Partial<{ question: string; answer: string }>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="بلوک پرسش‌وپاسخ"
      description="روی سایت آکاردئون بازشونده نشان داده می‌شود."
      footer={
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() =>
            onConfirm({
              title: title.trim() || null,
              items: items
                .map((x) => ({ question: x.question.trim(), answer: x.answer.trim() }))
                .filter((x) => x.question),
            })
          }
          confirmLabel="درج پرسش‌وپاسخ"
          disabled={!items.some((x) => x.question.trim())}
        />
      }
    >
      <div className="space-y-4" dir="rtl">
        <Field label="عنوان بلوک (اختیاری)">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً سؤالات پرتکرار" />
        </Field>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {items.map((x, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={x.question}
                  onChange={(e) => setItem(i, { question: e.target.value })}
                  placeholder={`پرسش ${i + 1}`}
                  className="flex-1 font-medium"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}
                  aria-label="حذف پرسش"
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={x.answer}
                onChange={(e) => setItem(i, { answer: e.target.value })}
                placeholder="پاسخ — پاراگراف‌ها را با یک خط خالی جدا کنید"
                rows={3}
              />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setItems((xs) => [...xs, { question: '', answer: '' }])}>
          <Plus className="h-4 w-4" />
          افزودن پرسش
        </Button>
      </div>
    </Dialog>
  );
}

/* ————————————————— گالری عکس ————————————————— */

export function GalleryDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PhotoGalleryAttrs;
  onConfirm: (attrs: PhotoGalleryAttrs) => void;
}) {
  const [images, setImages] = React.useState(initial.images);
  const [picking, setPicking] = React.useState(false);

  React.useEffect(() => {
    if (open) setImages(initial.images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const addFromLibrary = async () => {
    setPicking(true);
    try {
      const picked = await openMediaPicker({ tag: 'misc', title: 'انتخاب عکس برای گالری' });
      if (picked?.url) {
        setImages((xs) => [
          ...xs,
          { url: picked.url, caption: picked.caption ?? null, alt: picked.alt ?? null },
        ]);
      }
    } finally {
      setPicking(false);
    }
  };

  const move = (i: number, dir: -1 | 1) =>
    setImages((xs) => {
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const next = [...xs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const setImage = (i: number, patch: Partial<{ caption: string | null; alt: string | null }>) =>
    setImages((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="گالری عکس"
      description="عکس‌ها را از کتابخانهٔ رسانه انتخاب کنید و برای هرکدام زیرنویس بنویسید."
      footer={
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() => onConfirm({ images })}
          confirmLabel="درج گالری"
          disabled={images.length === 0}
        />
      }
    >
      <div className="space-y-3" dir="rtl">
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {images.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              هنوز عکسی انتخاب نشده است.
            </p>
          )}
          {images.map((img, i) => (
            <div key={`${img.url}-${i}`} className="flex gap-3 rounded-lg border p-2">
              <img src={img.url} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Input
                  value={img.caption ?? ''}
                  onChange={(e) => setImage(i, { caption: e.target.value || null })}
                  placeholder="زیرنویس (اختیاری)"
                  className="text-sm"
                />
                <Input
                  value={img.alt ?? ''}
                  onChange={(e) => setImage(i, { alt: e.target.value || null })}
                  placeholder="متن جایگزین (اختیاری)"
                  className="text-sm"
                />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="بالا">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="پایین">
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImages((xs) => xs.filter((_, j) => j !== i))}
                  aria-label="حذف عکس"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={addFromLibrary} disabled={picking}>
          <ImagePlus className="h-4 w-4" />
          {picking ? 'در حال انتخاب…' : 'افزودن از کتابخانهٔ رسانه'}
        </Button>
      </div>
    </Dialog>
  );
}

/* ————————————————— دکمهٔ درخواست تماس ————————————————— */

export function CallCtaDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: CallCtaAttrs;
  onConfirm: (attrs: CallCtaAttrs) => void;
}) {
  const [heading, setHeading] = React.useState(initial.heading ?? '');
  const [label, setLabel] = React.useState(initial.label);
  const [phoneDisplay, setPhoneDisplay] = React.useState(initial.phoneDisplay);
  const [phoneHref, setPhoneHref] = React.useState(initial.phoneHref);
  const [note, setNote] = React.useState(initial.note ?? '');

  React.useEffect(() => {
    if (open) {
      setHeading(initial.heading ?? '');
      setLabel(initial.label);
      setPhoneDisplay(initial.phoneDisplay);
      setPhoneHref(initial.phoneHref);
      setNote(initial.note ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const telOk = /^tel:\+?\d[\d-]*$/.test(phoneHref.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="دکمهٔ درخواست تماس"
      description="بنر دعوت به تماس؛ روی سایت دکمه مستقیم تماس تلفنی است."
      footer={
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() =>
            onConfirm({
              heading: heading.trim() || null,
              label: label.trim() || 'درخواست تماس',
              phoneHref: phoneHref.trim(),
              phoneDisplay: phoneDisplay.trim(),
              note: note.trim() || null,
            })
          }
          confirmLabel="درج دکمهٔ تماس"
          disabled={!telOk || !phoneDisplay.trim()}
        />
      }
    >
      <div className="space-y-4" dir="rtl">
        <Field label="سرخط بنر (اختیاری)">
          <Input value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="برای رزرو و مشاوره تماس بگیرید" />
        </Field>
        <Field label="متن دکمه">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="درخواست تماس" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="شمارهٔ نمایشی">
            <Input value={phoneDisplay} onChange={(e) => setPhoneDisplay(e.target.value)} placeholder="۰۲۶-۳۳۳۵۰۱۳۹" />
          </Field>
          <Field label="نشانی تماس (tel)">
            <Input value={phoneHref} onChange={(e) => setPhoneHref(e.target.value)} dir="ltr" className="text-left" placeholder="tel:02633350139" />
          </Field>
        </div>
        {!telOk && <p className="text-sm text-red-600">نشانی تماس باید با tel: شروع شود؛ مثلاً tel:02633350139</p>}
        <Field label="یادداشت زیر دکمه (اختیاری)">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="شنبه تا پنجشنبه، ۹ تا ۲۱" />
        </Field>
      </div>
    </Dialog>
  );
}
