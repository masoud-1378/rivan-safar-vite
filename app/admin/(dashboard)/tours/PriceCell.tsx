'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { AmountInput } from '@/components/ui/amount-input';
import { formatToman } from '@/lib/utils';
import { updateTourPrice } from './actions';
import { useToast } from '@/components/ui/toast';

interface PriceCellProps {
  id: string;
  price: number;
  onSaved: (price: number, formattedPrice: string) => void;
}

/**
 * قلم ۱ بخش ۲ کتابچه: ویرایش در جای «قیمت پایه» در همان جدول.
 * کلیک ← تایپ ← Enter. زیر قیمت نوشته شده که همین قیمت تومانی است که مشتری می‌بیند
 * (بخش ارزی فقط شفافیت داخلی است و روی سایت نمایش داده نمی‌شود).
 */
export function PriceCell({ id, price, onSaved }: PriceCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number | null>(price);
  const [error, setError] = useState('');
  const busyRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!editing) setValue(price);
  }, [price, editing]);

  useEffect(() => {
    if (editing) wrapRef.current?.querySelector('input')?.focus();
  }, [editing]);

  const startEdit = () => {
    setValue(price);
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError('');
    setValue(price);
  };

  const commit = async () => {
    if (busyRef.current) return;
    if (value === price) {
      cancel();
      return;
    }
    if (value === null) {
      setError('قیمت را وارد کنید.');
      return;
    }
    busyRef.current = true;
    try {
      const res = await updateTourPrice(id, value);
      setEditing(false);
      setError('');
      onSaved(res.price, res.formattedPrice);
      toast({ title: 'قیمت به‌روز شد', description: `قیمت پایه ${formatToman(res.price)} ثبت شد.` });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      busyRef.current = false;
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEdit}
        title="ویرایش قیمت پایه"
        aria-label={`ویرایش قیمت پایه، قیمت فعلی ${formatToman(price)}`}
        className="group flex min-h-[44px] w-full flex-col items-start justify-center gap-0.5 rounded-sm px-2 py-1 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
          {formatToman(price)}
          <Pencil className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
        <span className="text-[11px] text-muted-foreground">قیمتی که مشتری می‌بیند</span>
      </button>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="min-w-44 space-y-1.5 py-1"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void commit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      }}
      onBlur={(e) => {
        // فقط وقتی فوکوس واقعاً از ویرایشگر بیرون رفت ذخیره کن، نه با جابه‌جایی داخلی.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) void commit();
      }}
    >
      <AmountInput
        value={value}
        onChange={(v) => {
          setValue(v);
          if (error) setError('');
        }}
        unit="تومان"
        min={0}
      />
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground">Enter برای ذخیره، Esc برای انصراف</p>
      )}
    </div>
  );
}
