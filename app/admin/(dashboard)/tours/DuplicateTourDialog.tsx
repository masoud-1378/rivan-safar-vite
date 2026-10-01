'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { faSlug } from '@/lib/utils';
import { checkSlugUnique, saveTour, type TourRow } from './actions';
import { useToast } from '@/components/ui/toast';

interface DuplicateTourDialogProps {
  tour: TourRow;
  onClose: () => void;
  /** بعد از تکثیر موفق: شناسهٔ تور تازه (پیش‌نویس) برمی‌گردد تا فهرست به صفحهٔ ویرایشش برود. */
  onDone: (newId: string | null) => void;
}

const COPY_SUFFIX = ' (کپی)';

async function firstFreeSlug(base: string): Promise<string> {
  let candidate = base || 'tour';
  for (let i = 2; i < 50; i++) {
    const check = await checkSlugUnique(candidate);
    if (check.unique) return candidate;
    candidate = `${base || 'tour'}-${i}`;
  }
  return `${base || 'tour'}-${Date.now().toString(36)}`;
}

/**
 * قلم ۲ بخش ۲ کتابچه: تکثیر سالم تور.
 * - نامک خودکار از عنوان (قابل ویرایش، یکتایی‌اش همان‌جا بررسی می‌شود)
 * - مبدأ و ویزا از تور اصلی حفظ می‌شوند (فقط نمایش داده می‌شوند، نه ویرایش)
 * - فیلد «تاریخ حرکت بعدی» همین‌جا گرفته می‌شود
 * - کپی همیشه به‌صورت پیش‌نویس ساخته می‌شود تا تور زنده‌ای اتفاقی منتشر نشود
 *   (publishStatus='draft' صریح؛ وضعیت ظرفیت کپی هم «در انتظار تأیید ظرفیت» است).
 *
 * قرارداد اکشن‌ها (قلم ۳): تکثیر غیرمخرب است؛ این دیالوگ، دیالوگِ «تنظیمات»
 * است نه «تأیید ترسناک». دکمه‌اش هم از دکمهٔ بایگانی (مخرب) جداست.
 */
export function DuplicateTourDialog({ tour, onClose, onDone }: DuplicateTourDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(`${tour.title}${COPY_SUFFIX}`);
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [departure, setDeparture] = useState(tour.closestDeparture || '');
  const [titleError, setTitleError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [busy, setBusy] = useState(false);

  // نامک اولیهٔ خودکار و یکتا، از عنوانِ بدون پسوند «(کپی)».
  useEffect(() => {
    let alive = true;
    void firstFreeSlug(faSlug(tour.title)).then((s) => {
      if (alive) setSlug(s);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTitleChange = (v: string) => {
    setTitle(v);
    setTitleError('');
    if (!slugTouched) {
      const base = v.endsWith(COPY_SUFFIX) ? v.slice(0, -COPY_SUFFIX.length) : v;
      void firstFreeSlug(faSlug(base)).then(setSlug);
    }
  };

  const submit = async () => {
    if (busy) return;
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().toLowerCase();
    let ok = true;
    if (cleanTitle.length < 2) {
      setTitleError('عنوان تور لازم است.');
      ok = false;
    }
    if (!cleanSlug) {
      setSlugError('نامک لازم است.');
      ok = false;
    }
    if (!ok) return;
    setBusy(true);
    try {
      const unique = await checkSlugUnique(cleanSlug);
      if (!unique.unique) {
        setSlugError('این نامک قبلاً برای تور دیگری استفاده شده است.');
        setBusy(false);
        return;
      }
      const result = await saveTour(null, {
        ...tour,
        title: cleanTitle,
        slug: cleanSlug,
        closestDeparture: departure.trim(),
        // گیت انتشار (فاز ۲، مایگریشن 0011): کپی همیشه پیش‌نویس است، حتی اگر تور اصلی منتشرشده باشد.
        publishStatus: 'draft',
        // ظرفیت کپی نامشخص است — نه «تأییدشده».
        status: 'pending',
        statusLabel: 'در انتظار تأیید ظرفیت',
      });
      toast({
        title: 'تور تکثیر شد',
        description: `«${cleanTitle}» به‌صورت پیش‌نویس ساخته شد؛ مبدأ و ویزا از تور اصلی حفظ شدند.`,
      });
      onDone(result?.id ?? null);
    } catch (e) {
      toast({
        title: 'تکثیر ناموفق بود',
        description: e instanceof Error ? e.message : 'دوباره تلاش کنید.',
        variant: 'error',
      });
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="تکثیر تور"
      description={`از «${tour.title}» یک کپی می‌سازید. مبدأ و ویزا از تور اصلی حفظ می‌شوند و کپی به‌صورت پیش‌نویس ساخته می‌شود.`}
      footer={
        <>
          <Button size="lg" disabled={busy} onClick={() => void submit()} className="gap-2">
            <Copy className="size-4" />
            {busy ? 'در حال تکثیر…' : 'تکثیر تور'}
          </Button>
          <Button size="lg" variant="outline" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="عنوان تور جدید" htmlFor="dup-title" error={titleError}>
          <Input
            id="dup-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="عنوان تور…"
          />
        </Field>
        <Field
          label="نامک (آدرس اینترنتی)"
          htmlFor="dup-slug"
          hint="خودکار از عنوان ساخته می‌شود؛ اگر خواستید دستی عوضش کنید"
          error={slugError}
        >
          <Input
            id="dup-slug"
            dir="ltr"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
              setSlugError('');
            }}
            placeholder="tour-slug"
            className="font-mono"
          />
        </Field>
        <Field label="تاریخ حرکت بعدی" htmlFor="dup-departure" hint="مثلاً: ۱۵ آبان — روی کارت تور در سایت نمایش داده می‌شود">
          <Input
            id="dup-departure"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="مثلاً: ۱۵ آبان"
          />
        </Field>
        <dl className="space-y-1.5 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">مبدأ (حفظ می‌شود)</dt>
            <dd className="font-medium text-foreground">{tour.origin || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">ویزا (حفظ می‌شود)</dt>
            <dd className="font-medium text-foreground">{tour.visaRequired ? 'لازم است' : 'لازم نیست'}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">وضعیت کپی</dt>
            <dd className="font-medium text-foreground">پیش‌نویس</dd>
          </div>
        </dl>
      </div>
    </Dialog>
  );
}
