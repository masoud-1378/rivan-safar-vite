'use client';

import * as React from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { openMediaPicker } from './openMediaPicker';
import type { PickedImage } from './types';

export interface MediaFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  /** تصویر انتخاب‌شده؛ `null` یعنی خالی */
  value: PickedImage | null;
  onChange: (next: PickedImage | null) => void;
  /** قرارداد tag: مثل `guide:<slug>` یا `guide` (قرارداد `types.ts`) */
  tag: string;
  /** برچسب نمایشی نوع برای عنوان دیالوگ، مثل «راهنما» */
  tagLabel?: string;
}

/**
 * فیلد تک‌عکس فرم‌ها: پیش‌نمایش + «انتخاب از کتابخانه / آپلود» +
 * ورودی‌های کپشن و متن جایگزین + حذف. چسباندن لینک هم به‌عنوان
 * گزینهٔ فرعی مانده (دیگر تنها راه نیست).
 *
 * نکتهٔ ذخیره‌سازی: فرم‌ها فعلاً فقط `value.url` را ذخیره می‌کنند؛
 * کپشن و alt در خودِ مقدار (`PickedImage`) می‌ماند تا ستون‌هایش
 * به دیتابیس اضافه شود (یادداشت `content-editor/media/NOTES.md`).
 */
export function MediaField({ label, hint, htmlFor, value, onChange, tag, tagLabel }: MediaFieldProps) {
  const [showLink, setShowLink] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | null>(null);

  const pick = React.useCallback(() => {
    const title = tagLabel ? `کتابخانهٔ رسانه — ${tagLabel}` : undefined;
    void openMediaPicker({ tag, title }).then((picked) => {
      if (!picked) return;
      // کپشن و altِ تایپ‌شدهٔ کاربر مال همین مصرف است؛ با عوض‌شدن عکس حفظ می‌شود.
      onChange({
        ...picked,
        caption: value?.caption ?? picked.caption,
        alt: value?.alt ?? picked.alt,
      });
    });
  }, [tag, tagLabel, onChange, value]);

  const applyLink = () => {
    const url = link.trim();
    if (!url) {
      setLinkError('لینک را وارد کنید.');
      return;
    }
    try {
      // همان قانونی که اکشن ذخیره می‌سنجد: فقط آدرسی که روی سایت می‌آید.
      assertRenderableImageUrl(url);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : 'این لینک معتبر نیست.');
      return;
    }
    setLinkError(null);
    onChange({ url, caption: value?.caption, alt: value?.alt });
    setLink('');
    setShowLink(false);
  };

  return (
    <Field label={label} htmlFor={htmlFor} hint={hint}>
      {value?.url ? (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="h-20 w-32 shrink-0 overflow-hidden rounded-sm border border-border/70">
              <img
                src={value.url}
                alt={value.alt || 'پیش‌نمایش تصویر'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pick}
                className="gap-1.5 text-xs"
              >
                <ImagePlus className="size-4" />
                تغییر تصویر
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                حذف
              </Button>
              {!showLink && (
                <button
                  type="button"
                  onClick={() => setShowLink(true)}
                  className="inline-flex min-h-11 cursor-pointer items-center px-1 text-caption font-bold text-brand hover:underline"
                >
                  چسباندن لینک
                </button>
              )}
            </div>
          </div>
          {showLink && (
            <div>
              <Input
                dir="ltr"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyLink())}
                placeholder="https://…"
                aria-label="لینک تصویر"
                className="text-start"
              />
              <div className="mt-1.5">
                <Button type="button" size="sm" onClick={applyLink}>
                  ثبت لینک
                </Button>
              </div>
              {linkError && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {linkError}
                </p>
              )}
              <p className="mt-1 text-caption text-muted-foreground">
                لینک Unsplash یا هر آدرسی که روی سایت باز می‌شود.
              </p>
            </div>
          )}
          <Field label="کپشن" hint="زیر تصویر نمایش داده می‌شود (اختیاری)">
            <Input
              value={value.caption ?? ''}
              onChange={(e) => onChange({ ...value, caption: e.target.value })}
              aria-label="کپشن تصویر"
            />
          </Field>
          <Field label="متن جایگزین (alt)" hint="برای دسترس‌پذیری و سئو">
            <Input
              value={value.alt ?? ''}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              aria-label="متن جایگزین تصویر"
            />
          </Field>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={pick}
              className="gap-2 text-xs"
            >
              <ImagePlus className="size-4" />
              انتخاب از کتابخانه / آپلود
            </Button>
            {!showLink && (
                <button
                type="button"
                onClick={() => setShowLink(true)}
                className="inline-flex min-h-11 cursor-pointer items-center px-1 text-caption font-bold text-brand hover:underline"
              >
                چسباندن لینک
              </button>
            )}
          </div>
          {showLink && (
            <div>
              <Input
                dir="ltr"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyLink())}
                placeholder="https://…"
                aria-label="لینک تصویر"
                className="text-start"
              />
              <div className="mt-1.5">
                <Button type="button" size="sm" onClick={applyLink}>
                  ثبت لینک
                </Button>
              </div>
              {linkError && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {linkError}
                </p>
              )}
              <p className="mt-1 text-caption text-muted-foreground">
                لینک Unsplash یا هر آدرسی که روی سایت باز می‌شود.
              </p>
            </div>
          )}
        </div>
      )}
    </Field>
  );
}
