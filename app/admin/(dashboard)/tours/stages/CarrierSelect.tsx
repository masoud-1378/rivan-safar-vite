'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listCarriers, type CarrierOption } from '../carriers';

interface CarrierSelectProps {
  /** مقدار فعلی فیلد airline فرم */
  value: string;
  onChange: (airline: string) => void;
}

/**
 * انتخاب ایرلاین از جدول carriers (موج ۳).
 *
 * کمبوباکس جست‌وجوپذیر: روی نام فارسی، نام انگلیسی و کد یاتا فیلتر می‌کند و
 * متن تایپ‌شده همیشه به‌عنوان مقدار آزاد نگه داشته می‌شود (خالی = خالی).
 * اگر جدول خالی باشد، همان اینپوت متنی ساده می‌ماند با راهنمای صادقانهٔ
 * «فهرستی نیست» — هیچ‌چیز حدس زده نمی‌شود. اختیاری است و جزو گیت انتشار نیست.
 */
export default function CarrierSelect({ value, onChange }: CarrierSelectProps) {
  // null یعنی هنوز بارگذاری نشده؛ [] یعنی فهرستی نیست.
  const [carriers, setCarriers] = useState<CarrierOption[] | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    listCarriers()
      .then((rows) => {
        if (alive) setCarriers(rows);
      })
      .catch(() => {
        if (alive) setCarriers([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const loading = carriers === null;
  const empty = !loading && carriers.length === 0;

  const query = (value ?? '').trim();
  const qLower = query.toLowerCase();
  const filtered = useMemo(() => {
    if (!carriers || carriers.length === 0 || !query) return carriers ?? [];
    return carriers.filter(
      (c) =>
        c.nameFa.includes(query) ||
        (c.nameEn ?? '').toLowerCase().includes(qLower) ||
        (c.iataCode ?? '').toLowerCase().includes(qLower),
    );
  }, [carriers, query, qLower]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const pick = (c: CarrierOption) => {
    onChange(c.nameFa);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) {
      if (e.key === 'ArrowDown' && !empty) setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(filtered[highlight] ?? filtered[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const hint = loading
    ? 'در حال بارگذاری فهرست…'
    : empty
      ? 'فهرستی نیست؛ نام را دستی بنویسید.'
      : 'از فهرست انتخاب کنید یا دستی بنویسید.';

  return (
    <Field label="ایرلاین" hint={hint}>
      <div ref={wrapRef} className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={value ?? ''}
            onChange={(e) => {
              onChange(e.target.value);
              if (!empty) setOpen(true);
            }}
            onFocus={() => {
              if (!empty) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder="جست‌وجو یا نوشتن نام ایرلاین…"
            className="text-xs pe-14 max-md:text-base"
            role={empty ? undefined : 'combobox'}
            aria-expanded={empty ? undefined : open}
            aria-autocomplete={empty ? undefined : 'list'}
          />
          <div className="absolute end-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {!loading && (value ?? '') !== '' && (
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="پاک کردن"
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
            {!empty && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? 'بستن فهرست' : 'باز کردن فهرست'}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>

        {!empty && open && (
          <div
            role="listbox"
            className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-border bg-popover shadow-lg"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-caption text-muted-foreground">
                موردی در فهرست نیست؛ همین متن ذخیره می‌شود.
              </p>
            ) : (
              filtered.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(c)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-start',
                    i === highlight ? 'bg-muted' : 'bg-transparent',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-foreground">
                      {c.nameFa}
                      {c.iataCode ? <span className="font-medium text-muted-foreground"> ({c.iataCode})</span> : null}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {[c.nameEn, c.country].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Field>
  );
}
