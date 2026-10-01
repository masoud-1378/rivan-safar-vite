'use client';

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
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="grow"
        />
        <DatePicker
          clearable={false}
          weekday={false}
          className="w-40 shrink-0"
          placeholder="از تقویم"
          onChange={(d) => {
            if (d) onChange(formatJalali(d, { weekday: false }));
          }}
        />
      </div>
    </Field>
  );
}
