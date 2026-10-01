'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { faSlug } from '@/lib/utils';
import { checkSlugUnique, saveTour, type TourRow } from './actions';
import { useToast } from '@/components/ui/toast';
import { DepartureDateField } from './DepartureDateField';
import { safeErrorMessage } from '@/src/lib/error-message';

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
  // گشت (ایراد ۲): ورودی عنوان آنکنترلد است (ref + defaultValue) تا تایپ کردن
  // هیچ ریرندری تحریک نکند؛ مقدار نهایی روی دیبونس/blur کامیت می‌شود و نامک
  // از همان عنوان نهایی مشتق می‌شود.
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  // نسخهٔ ref برای خواندن تازه داخل closure دیبونس (جلوگیری از بازنویسی نامک دستی).
  const slugTouchedRef = useRef(false);
  const [departure, setDeparture] = useState(tour.closestDeparture || '');
  const [titleError, setTitleError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [busy, setBusy] = useState(false);
  // گشت (ایراد ۷): نگهبان کهنگی درخواست نامک — پاسخ‌های دیررسِ نویسه‌های قبلی
  // نباید نامکِ نویسهٔ آخر را بازنویسی کنند.
  const slugReq = useRef(0);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (slugTimer.current) clearTimeout(slugTimer.current);
    };
  }, []);

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

  const deriveSlug = (titleValue: string) => {
    const my = ++slugReq.current;
    const base = titleValue.endsWith(COPY_SUFFIX) ? titleValue.slice(0, -COPY_SUFFIX.length) : titleValue;
    void firstFreeSlug(faSlug(base)).then((s) => {
      if (slugReq.current === my) setSlug(s);
    });
  };

  /** کامیت عنوان: خطای عنوان پاک می‌شود و اگر نامک دستی نشده، از عنوان نهایی بازسازی می‌شود. */
  const commitTitle = () => {
    setTitleError('');
    if (slugTouchedRef.current) return;
    deriveSlug(titleRef.current?.value ?? '');
  };

  // «بازسازی خودکار از عنوان» (T14): اقدام صریح کاربر — guard دستی‌بودن نادیده گرفته می‌شود.
  const rebuildSlugFromTitle = () => {
    setSlugTouched(false);
    slugTouchedRef.current = false;
    deriveSlug(titleRef.current?.value ?? '');
  };

  const onTitleInput = () => {
    setTitleError('');
    if (slugTouchedRef.current) return;
    // گشت (ایراد ۷): دیبونس ۳۵۰ms + نگهبان کهنگی؛ با هر نویسه یک اکشن سرور نزن
    // و پاسخ دیررس، نامکِ تازه‌تر را خراب نکند.
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(() => {
      if (!slugTouchedRef.current) deriveSlug(titleRef.current?.value ?? '');
    }, 350);
  };

  const submit = async () => {
    if (busy) return;
    const cleanTitle = (titleRef.current?.value ?? '').trim();
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
        // شرایط انتشار (فاز ۲، مایگریشن 0011): کپی همیشه پیش‌نویس است، حتی اگر تور اصلی منتشرشده باشد.
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
        description: safeErrorMessage(e, 'دوباره تلاش کنید.'),
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
      description={`از «${tour.title}» یک نسخهٔ تازه می‌سازید. مبدأ و ویزا از تور اصلی حفظ می‌شوند و نسخهٔ تازه به‌صورت پیش‌نویس ساخته می‌شود.`}
      footer={
        <>
          <Button size="md" disabled={busy} onClick={() => void submit()} className="gap-2">
            <Copy className="size-4" />
            {busy ? 'در حال تکثیر…' : 'تکثیر تور'}
          </Button>
          <Button size="md" variant="outline" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="عنوان تور جدید" htmlFor="dup-title" error={titleError}>
          <Input
            id="dup-title"
            ref={titleRef}
            defaultValue={`${tour.title}${COPY_SUFFIX}`}
            onInput={onTitleInput}
            onBlur={commitTitle}
            placeholder="عنوان تور…"
          />
        </Field>
        <div>
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
                slugTouchedRef.current = true;
                setSlugError('');
              }}
              placeholder="tour-slug"
              className="font-mono"
            />
          </Field>
          <button
            type="button"
            onClick={rebuildSlugFromTitle}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
          >
            <RefreshCw className="size-3" />
            بازسازی خودکار از عنوان
          </button>
        </div>
        {/* تاریخ حرکت بعدی (T10): پیش‌پر از تور اصلی؛ DatePicker شمسی فقط میان‌بر نوشتن متن است */}
        <DepartureDateField
          value={departure}
          onChange={setDeparture}
        />
        <dl className="space-y-1.5 rounded-sm border border-border/70 bg-muted/40 p-3 text-xs">
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
