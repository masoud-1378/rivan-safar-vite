'use client';

import * as React from 'react';
import { ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { cn } from '@/lib/utils';

export interface DualImageInputProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** آدرس فعلی تصویر؛ رشتهٔ خالی یعنی خالی */
  value: string;
  onChange: (url: string) => void;
  /**
   * آپلود فایل روی دستگاه؛ آدرس عمومی را برمی‌گرداند.
   * خطا را با پیام فارسی throw کند تا همین‌جا نمایش داده شود.
   */
  uploadFile: (file: File) => Promise<string>;
  accept?: string;
  /** برای عکس لیدر: پیش‌نمایش دایره‌ای */
  round?: boolean;
  uploadLabel?: string;
  changeLabel?: string;
}

/**
 * ورودی دوگانهٔ تصویر (موج ۵): آپلود فایل از دستگاه **یا** چسباندن لینک.
 * جایگزین الگوی «فقط فایل» در فرم لیدر، گالری و هتل‌ها.
 */
export function DualImageInput({
  label,
  hint,
  value,
  onChange,
  uploadFile,
  accept = 'image/*',
  round = false,
  uploadLabel = 'آپلود عکس',
  changeLabel = 'تغییر عکس',
}: DualImageInputProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showLink, setShowLink] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | null>(null);

  const url = value.trim();

  async function onPickFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const next = await uploadFile(file);
      onChange(next);
      setShowLink(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'آپلود نشد؛ دوباره تلاش کنید.');
    } finally {
      setUploading(false);
    }
  }

  function applyLink() {
    const next = link.trim();
    if (!next) {
      setLinkError('لینک را وارد کنید.');
      return;
    }
    try {
      assertRenderableImageUrl(next);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : 'این لینک معتبر نیست.');
      return;
    }
    setLinkError(null);
    onChange(next);
    setLink('');
    setShowLink(false);
    setError(null);
  }

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {url ? (
            <img
              src={url}
              alt=""
              className={cn(
                'h-14 w-14 object-cover',
                round ? 'rounded-full' : 'rounded-sm border border-border/70'
              )}
            />
          ) : (
            <div
              className={cn(
                'grid h-14 w-14 place-items-center bg-muted text-muted-foreground',
                round ? 'rounded-full' : 'rounded-sm border border-border/70'
              )}
              aria-hidden
            >
              <ImagePlus className="size-5" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-busy={uploading}
              onClick={() => fileRef.current?.click()}
              className="gap-1.5 text-panel-caption"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {uploading ? 'در حال آپلود…' : url ? changeLabel : uploadLabel}
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
            {url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                className="gap-1.5 text-panel-caption text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                حذف
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            aria-label="انتخاب فایل عکس"
            onChange={(e) => {
              void onPickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {error && (
          <p role="alert" className="text-panel-caption text-destructive">
            {error}
          </p>
        )}

        {showLink && (
          <div className="space-y-1.5">
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
            <div>
              <Button type="button" size="sm" onClick={applyLink}>
                ثبت لینک
              </Button>
            </div>
            {linkError && (
              <p role="alert" className="text-panel-caption text-destructive">
                {linkError}
              </p>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}

/**
 * دکمهٔ دوگانهٔ «افزودن عکس» برای گالری‌های چندتایی (موج ۵):
 * آپلود چند فایل **یا** افزودن تکی با لینک.
 */
export function DualGalleryAdd({
  onFiles,
  onLink,
  uploading = false,
  multiple = true,
  addLabel = 'افزودن عکس',
}: {
  onFiles: (files: File[]) => void;
  onLink: (url: string) => void;
  uploading?: boolean;
  multiple?: boolean;
  addLabel?: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [showLink, setShowLink] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | null>(null);

  function applyLink() {
    const next = link.trim();
    if (!next) {
      setLinkError('لینک را وارد کنید.');
      return;
    }
    try {
      assertRenderableImageUrl(next);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : 'این لینک معتبر نیست.');
      return;
    }
    setLinkError(null);
    onLink(next);
    setLink('');
    setShowLink(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-busy={uploading}
          onClick={() => fileRef.current?.click()}
          className="gap-1.5 text-panel-caption"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploading ? 'در حال آپلود…' : addLabel}
        </Button>
        {!showLink && (
          <button
            type="button"
            onClick={() => setShowLink(true)}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 px-1 text-caption font-bold text-brand hover:underline"
          >
            <Link2 className="size-3.5" />
            چسباندن لینک
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          aria-label="انتخاب فایل عکس"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (files.length === 0 || uploading) return;
            onFiles(files);
          }}
        />
      </div>
      {showLink && (
        <div className="space-y-1.5">
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
          <div>
            <Button type="button" size="sm" onClick={applyLink}>
              ثبت لینک
            </Button>
          </div>
          {linkError && (
            <p role="alert" className="text-panel-caption text-destructive">
              {linkError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
