'use client';

import * as React from 'react';
import { Images, Loader2, Search, Trash2, Upload } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { assertUploadImage } from '@/src/lib/upload-policy';
import { deleteMedia, listMedia, uploadMedia } from './actions';
import { mediaKindLabel, type MediaListItem, type PickedImage } from './types';

export interface MediaPickerDialogProps {
  open: boolean;
  /** tag قرارداد (`guide:<slug>` یا `guide`) — فیلتر گرید و برچسب آپلود تازه */
  tag: string;
  title?: string;
  onPick: (picked: PickedImage) => void;
  onClose: () => void;
}

/** دیالوگ کتابخانهٔ رسانه: گرید بندانگشتی + جست‌وجو + آپلود تازه + حذف. */
export function MediaPickerDialog({ open, tag, title, onPick, onClose }: MediaPickerDialogProps) {
  const [items, setItems] = React.useState<MediaListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MediaListItem | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const cleanTag = (tag || '').trim() || 'misc';
  const kindLabel = mediaKindLabel(cleanTag);

  const load = React.useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        setItems(await listMedia(cleanTag, q));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خواندن کتابخانه ناموفق بود.');
      } finally {
        setLoading(false);
      }
    },
    [cleanTag],
  );

  React.useEffect(() => {
    if (open) {
      setQuery('');
      void load('');
    }
  }, [open, load]);

  // جست‌وجو با مکث کوتاه تا با هر نویسه به سرور نزنیم.
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query, open, load]);

  const onFileChosen = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    // اعتبارسنجی سمت کاربر برای پیام سریع؛ سرور دوباره می‌سنجد.
    try {
      await assertUploadImage(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'این فایل برای آپلود مناسب نیست.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', f);
      const item = await uploadMedia(cleanTag, '', fd);
      setItems((prev) => [item, ...prev]);
      // عکس تازه‌آپلودشده همان لحظه انتخاب می‌شود.
      onPick({ url: item.url, alt: item.altFa });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'آپلود عکس ناموفق بود.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حذف رسانه ناموفق بود.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => !v && onClose()}
        title={title ?? `کتابخانهٔ رسانه — ${kindLabel}`}
        description="از میان عکس‌های همین بخش انتخاب کنید یا عکس تازه آپلود کنید."
        className="max-w-3xl"
        footer={
          <Button type="button" variant="outline" onClick={onClose}>
            انصراف
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جست‌وجو در نام و آدرس…"
                aria-label="جست‌وجو در کتابخانهٔ رسانه"
                className="pr-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="gap-1.5 shrink-0"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? 'در حال آپلود…' : 'آپلود تازه'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onFileChosen(e.target.files)}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-sm bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-border py-10 text-center">
              <Images className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                هنوز رسانه‌ای با این برچسب ثبت نشده است.
              </p>
              <p className="text-xs text-muted-foreground">
                با «آپلود تازه» اولین عکس را اضافه کنید.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[50dvh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onPick({ url: item.url, alt: item.altFa })}
                    title={item.altFa || item.url}
                    className={cn(
                      'block aspect-video w-full cursor-pointer overflow-hidden rounded-sm border border-border/70',
                      'transition hover:border-brand focus-visible:outline-none focus-visible:border-brand',
                    )}
                  >
                    <img
                      src={item.url}
                      alt={item.altFa || 'تصویر کتابخانه'}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                  {/* حذف فقط برای رسانهٔ همین برچسب؛ رسانهٔ بخش‌های دیگر فقط دیدنی است. */}
                  {item.source === cleanTag && (
                    <button
                      type="button"
                      aria-label={`حذف ${item.altFa || 'رسانه'}`}
                      onClick={() => setDeleteTarget(item)}
                      className={cn(
                        'absolute left-1 top-1 cursor-pointer rounded-sm bg-black/60 p-1.5 text-white',
                        'opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100',
                      )}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="حذف رسانه"
        description="این عکس از کتابخانه حذف می‌شود و دیگر در فهرست نمی‌آید. اگر جایی استفاده شده باشد، همان‌جا می‌ماند؛ فقط از کتابخانه پاک می‌شود."
        confirmText="حذف رسانه"
        destructive
        onConfirm={confirmDelete}
      />
    </>
  );
}
