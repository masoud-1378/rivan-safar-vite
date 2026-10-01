'use client';

import { useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, Input } from '@/components/ui/input';
import { formatJalali } from '@/lib/jalali';

interface DepartureDateFieldProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
}

/**
 * «تاریخ حرکت بعدی» — همان ستون closestDeparture که روی سایت نمایش داده می‌شود.
 * متن آزاد ذخیره می‌ماند (داده‌های قدیمی مثل «۱۵ آبان» دست نمی‌خورند)؛
 * DatePicker شمسی فقط میان‌بری است که همان متن را با قالب یکدست می‌نویسد.
 */
export function DepartureDateField({
  value,
  onChange,
  label = 'تاریخ حرکت بعدی',
  hint = 'روی کارت تور در سایت نمایش داده می‌شود',
  error,
  placeholder = 'مثلاً: ۱۵ آبان',
}: DepartureDateFieldProps) {
  // F10: تاریخ انتخاب‌شده از تقویم روی خودِ دکمه دیده می‌شود (کنترل‌شده).
  const [picked, setPicked] = useState<Date | null>(null);
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            // تایپ دستی، انتخاب تقویمیِ قبلی را بی‌اعتبار می‌کند.
            setPicked(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="grow"
        />
        <DatePicker
          clearable
          weekday={false}
          className="w-40 shrink-0"
          placeholder="از تقویم انتخاب کنید"
          value={picked}
          onChange={(d) => {
            setPicked(d);
            onChange(d ? formatJalali(d, { weekday: false }) : '');
          }}
        />
      </div>
    </Field>
  );
}
