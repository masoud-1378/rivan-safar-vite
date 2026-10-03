'use client';

import { Field, Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fa } from '@/lib/utils';

/**
 * فیلدهای سئوی صفحه (عنوان و توضیحات متا) با شمارندهٔ نرم و پیش‌نمایش SERP.
 *
 * هیچ سقف سختی نیست (دستور مسعود): شمارنده فقط راهنماست و ذخیره را بلاک
 * نمی‌کند. وقتی از آستانهٔ نمایشی گوگل رد شود، شمارنده کهربایی می‌شود.
 */

const TITLE_SOFT_LIMIT = 60;
const DESCRIPTION_SOFT_LIMIT = 160;

function SoftCount({ len, limit }: { len: number; limit: number }) {
  const over = len > limit;
  return (
    <p
      className={`text-end text-[11px] ${over ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
      aria-live="polite"
    >
      {fa(len)} نویسه
      {over && ` — از حد نمایشی گوگل (${fa(limit)}) بیشتر شد؛ ذخیره می‌شود ولی در نتایج کوتاه دیده می‌شود.`}
    </p>
  );
}

export interface SeoMetaFieldsProps {
  metaTitle: string;
  onMetaTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  /** عنوان صفحه — وقتی «عنوان سئو» خالی است در پیش‌نمایش می‌آید. */
  titleFallback?: string;
  /** نشانی نمایشی صفحه در پیش‌نمایش (مثلاً /destination/dubai)؛ دامنه حدس زده نمی‌شود. */
  urlPreview?: string;
  /** خطای اعتبارسنجی عنوان از فرم والد (اختیاری). */
  metaTitleError?: string;
  /** خطای اعتبارسنجی توضیحات از فرم والد (اختیاری). */
  metaDescriptionError?: string;
}

export function SeoMetaFields({
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  titleFallback = '',
  urlPreview = '',
  metaTitleError,
  metaDescriptionError,
}: SeoMetaFieldsProps) {
  const title = metaTitle.trim() || titleFallback.trim() || 'عنوان صفحه';
  const description = metaDescription.trim();
  return (
    <div className="space-y-4">
      <Field
        label="عنوان سئو (Meta Title)"
        hint="راهنمای نرم: گوگل حدود ۶۰ نویسه را نشان می‌دهد؛ بیشتر هم ذخیره می‌شود و مشکلی نیست."
        error={metaTitleError}
      >
        <div className="space-y-1.5">
          <Input
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="مثال: تور استانبول با اقامت در مرکز شهر"
          />
          <SoftCount len={metaTitle.length} limit={TITLE_SOFT_LIMIT} />
        </div>
      </Field>

      <Field
        label="توضیحات سئو (Meta Description)"
        hint="گوگل حدود ۱۶۰ کاراکتر نشان می‌دهد؛ بیشتر از آن هم ذخیره می‌شود، فقط در نتایج کوتاه‌تر دیده می‌شود."
        error={metaDescriptionError}
      >
        <div className="space-y-1.5">
          <Textarea
            autoResize
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="توضیح کوتاهی که در نتایج جست‌وجو نمایش داده می‌شود…"
          />
          <SoftCount len={metaDescription.length} limit={DESCRIPTION_SOFT_LIMIT} />
        </div>
      </Field>

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">پیش‌نمایش در نتایج گوگل</p>
        <div dir="rtl" className="space-y-1 rounded-sm bg-card p-3">
          <p className="truncate text-base leading-7 text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
          {urlPreview && (
            <p dir="ltr" className="truncate text-left text-xs leading-5 text-[#006621] dark:text-[#a8c7a0]">
              {urlPreview}
            </p>
          )}
          <p className="text-[13px] leading-6 text-[#545454] dark:text-[#bdc1c6]">
            {description || 'توضیحات سئو هنوز نوشته نشده؛ گوگل خودش از متن صفحه برمی‌دارد.'}
          </p>
        </div>
      </div>
    </div>
  );
}
