'use client';

import * as React from 'react';
import { ImagePlus, Link2, Loader2, Trash2, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import type { TourGalleryAspect } from '@/app/admin/(dashboard)/tours/experience-types';
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
 * نسبت تصویر ویدیوی گالری (موج ۶): ۱۶:۹ افقی / مربعی / ۹:۱۶ عمودی.
 * همان TourGalleryAspect است؛ این نام برای سازگاری نگه داشته شده.
 */
export type GalleryVideoAspect = TourGalleryAspect;

export const GALLERY_VIDEO_ASPECT_OPTIONS: Array<{ value: GalleryVideoAspect; label: string }> = [
  { value: 'landscape', label: 'افقی (۱۶:۹)' },
  { value: 'square', label: 'مربعی' },
  { value: 'portrait', label: 'عمودی (۹:۱۶)' },
];

/** پسوندهای فایل ویدیویی که تگ <video> مرورگر مستقیم پخششان می‌کند. */
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v'];

/**
 * لینک ویدیوی گالری: یا مسیر لوکالِ خود سایت، یا https که مستقیم به فایل
 * ویدیو برسد. لینک‌های اشتراک‌گذاری (مثل صفحهٔ تماشای یوتیوب) این‌جا قبول
 * نیستند چون در <video> پخش نمی‌شوند.
 */
export function isRenderableVideoUrl(raw: string): boolean {
  const url = (raw || '').trim();
  if (!url) return false;
  let pathname: string;
  if (url.startsWith('/') && !url.startsWith('//')) {
    // مسیر لوکال — کوئری و هش را جدا می‌کنیم، فقط پسوند می‌ماند.
    pathname = url.split(/[?#]/)[0];
  } else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      pathname = parsed.pathname;
    } catch {
      return false;
    }
  }
  const ext = pathname.toLowerCase().split('.').pop() ?? '';
  return VIDEO_EXTENSIONS.includes(ext);
}

/** پیام خطای اعتبارسنجی لینک ویدیو (چه چیزی را عوض کند). */
export const UNSUPPORTED_VIDEO_URL_ERROR =
  'لینک باید مستقیم به فایل ویدیو برسد (mp4، webm، mov یا m4v)؛ لینک صفحهٔ تماشا پخش نمی‌شود.';

/** لینک را می‌سنجد و اگر سازگار نبود، با پیام فارسی خطا می‌دهد. */
export function assertRenderableVideoUrl(raw: string): void {
  const url = (raw || '').trim();
  if (!url) throw new Error('لینک ویدیو را وارد کنید.');
  if (!isRenderableVideoUrl(url)) throw new Error(UNSUPPORTED_VIDEO_URL_ERROR);
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
  videoAdd,
}: {
  onFiles: (files: File[]) => void;
  onLink: (url: string) => void;
  uploading?: boolean;
  multiple?: boolean;
  addLabel?: string;
  /**
   * موج ۶ — افزودن ویدیو به گالری: فقط با لینک مستقیم فایل (بدون آپلود؛
   * اکشن‌های سرور سقف حجم کمی دارند و ویدیوها چند ده مگابایت‌اند).
   */
  videoAdd?: {
    onAdd: (url: string, aspect: GalleryVideoAspect) => void;
    label?: string;
  };
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [showLink, setShowLink] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | null>(null);
  // فرم ویدیو — جدا از فرم لینک عکس تا خطاهایشان قاطی نشود.
  const [showVideo, setShowVideo] = React.useState(false);
  const [videoLink, setVideoLink] = React.useState('');
  const [videoAspect, setVideoAspect] = React.useState<GalleryVideoAspect>('landscape');
  const [videoError, setVideoError] = React.useState<string | null>(null);

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

  function applyVideoLink() {
    const next = videoLink.trim();
    try {
      assertRenderableVideoUrl(next);
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : 'این لینک معتبر نیست.');
      return;
    }
    setVideoError(null);
    if (videoAdd) videoAdd.onAdd(next, videoAspect);
    setVideoLink('');
    setVideoAspect('landscape');
    setShowVideo(false);
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
        {videoAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowVideo((v) => !v);
              setShowLink(false);
            }}
            className="gap-1.5 text-panel-caption"
            aria-expanded={showVideo}
          >
            <Clapperboard className="size-4" />
            {videoAdd.label ?? 'افزودن ویدیو'}
          </Button>
        )}
        {!showLink && (
          <button
            type="button"
            onClick={() => {
              setShowLink(true);
              setShowVideo(false);
            }}
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
      {videoAdd && showVideo && (
        <div className="space-y-2 rounded-control border border-border bg-background p-3">
          <Field label="لینک مستقیم فایل ویدیو" hint="فقط فایل (mp4، webm یا mov)؛ لینک صفحهٔ تماشا پخش نمی‌شود.">
            <Input
              dir="ltr"
              value={videoLink}
              onChange={(e) => {
                setVideoLink(e.target.value);
                setVideoError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyVideoLink())}
              placeholder="https://…/tour.mp4"
              aria-label="لینک ویدیو"
              className="text-start"
            />
          </Field>
          <Field label="نسبت تصویر ویدیو">
            <Select
              value={videoAspect}
              onChange={(e) => setVideoAspect(e.target.value as GalleryVideoAspect)}
              options={GALLERY_VIDEO_ASPECT_OPTIONS}
              aria-label="نسبت تصویر ویدیو"
            />
          </Field>
          <div>
            <Button type="button" size="sm" onClick={applyVideoLink}>
              ثبت ویدیو
            </Button>
          </div>
          {videoError && (
            <p role="alert" className="text-panel-caption text-destructive">
              {videoError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
