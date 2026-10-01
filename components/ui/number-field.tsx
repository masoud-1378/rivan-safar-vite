"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn, en, fa } from "@/lib/utils";

export interface NumberFieldProps {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** عدد. Plus sits at the inline-start (right in RTL), display uses Persian digits. */
export function NumberField({ value, defaultValue = 0, onChange, min = -Infinity, max = Infinity, step = 1, disabled, className, ...aria }: NumberFieldProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  // بازبینی مجدد: value=null یعنی «تنظیم‌نشده» — خالی نمایش داده می‌شود،
  // نه صفرِ پیش‌فرضِ داخلی (که با state والد ناسازگار بود).
  const isUnset = value === null;
  const n = value ?? internal;

  function set(next: number) {
    // یافتهٔ ۶: clamp بی‌صدا برداشته شد — مقدار خارج از بازه نگه داشته می‌شود
    // تا ولیدیشن (سرور/فیلد) خطای فارسی‌اش را نشان بدهد. دکمه‌های +/− همچنان
    // در کرانه‌ها غیرفعال‌اند و خودشان از بازه بیرون نمی‌زنند.
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  const btn = "flex w-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className={cn("inline-flex h-10 items-stretch overflow-hidden rounded-field border-line border-input bg-background/60 shadow-field", className)} role="group" aria-label={aria["aria-label"]}>
      <button type="button" aria-label="افزایش" disabled={disabled || n >= max} onClick={() => set(n + step)} className={btn}>
        <Plus className="size-4" />
      </button>
      <input
        inputMode="numeric"
        value={isUnset ? '' : fa(n)}
        placeholder={isUnset ? '—' : undefined}
        disabled={disabled}
        onChange={(e) => {
          const parsed = Number(en(e.target.value).replace(/[^\d.-]/g, ""));
          if (!Number.isNaN(parsed)) set(parsed);
        }}
        className="w-14 border-x border-input bg-transparent text-center text-sm font-semibold outline-none"
      />
      <button type="button" aria-label="کاهش" disabled={disabled || n <= min} onClick={() => set(n - step)} className={btn}>
        <Minus className="size-4" />
      </button>
    </div>
  );
}
