'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { faSlug, formatToman, en } from '@/lib/utils';
import { JALALI_MONTHS, toJalali, formatJalali } from '@/lib/jalali';
import { checkSlugUnique, saveTour, getTourById, type TourRow, type TourRichFields } from './actions';
import { useToast } from '@/components/ui/toast';
import { DepartureDateField } from './DepartureDateField';
import { safeErrorMessage } from '@/src/lib/error-message';
import { SmartSuggestion } from './SmartSuggestion';

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
 * - (قلم ۳ موج ۰) قیمتِ مبدأ دیده می‌شود و انتخابش صریح است («همین قیمت بماند» /
 *   «خودم وارد می‌کنم»)؛ نشان «حرکت تضمین‌شده» به کپی منتقل نمی‌شود چون
 *   ظرفیت نسخهٔ تازه «در انتظار تأیید» است — قول حقوقی را نمی‌شود بی‌صدا منتقل کرد.
 *
 * قرارداد اکشن‌ها (قلم ۳): تکثیر غیرمخرب است؛ این دیالوگ، دیالوگِ «تنظیمات»
 * است نه «تأیید ترسناک». دکمه‌اش هم از دکمهٔ بایگانی (مخرب) جداست.
 */
export function DuplicateTourDialog({ tour, onClose, onDone }: DuplicateTourDialogProps) {
  const { toast } = useToast();
  // تیم «فرم تورها»: ردیف کامل تور (همراه فیلدهای غنی/سئو) خوانده می‌شود تا
  // تکثیر، متن‌های غنی و متا را هم با خودش ببرد — چیزی بی‌صدا گم نمی‌شود.
  const [fullTour, setFullTour] = useState<(TourRow & Partial<TourRichFields>) | null>(null);
  // نکتهٔ ۲ QA: دکمهٔ «کپی تور» تا رسیدن پاسخ getTourById غیرفعال است؛ وگرنه
  // کپی از ردیف فهرست (بدون متن غنی/متا) ساخته می‌شود. اگر خوانش خطا بخورد،
  // دکمه فعال می‌شود و همان رفتار قبلی (ردیف فهرست) اعمال می‌شود.
  const [fullLoaded, setFullLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    setFullLoaded(false);
    getTourById(tour.id)
      .then((r) => { if (alive) { setFullTour(r); setFullLoaded(true); } })
      .catch(() => { if (alive) { setFullTour(null); setFullLoaded(true); } });
    return () => { alive = false; };
  }, [tour.id]);
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
  // قلم ۳ موج ۰: قیمتِ نسخهٔ تازه انتخاب صریح مدیر است، نه کپیِ بی‌صدای قیمت مبدأ.
  const [priceMode, setPriceMode] = useState<'keep' | 'custom'>('keep');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState('');
  // گشت (ایراد ۷): نگهبان کهنگی درخواست نامک — پاسخ‌های دیررسِ نویسه‌های قبلی
  // نباید نامکِ نویسهٔ آخر را بازنویسی کنند.
  const slugReq = useRef(0);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * قلم ۵ موج ۲: تاریخ تکثیرِ امن — تاریخ حرکتِ پیشنهادی که نه در گذشته است،
   * نه با تاریخ تور اصلی یکی؛ فقط پیشنهاد با «پذیرفتن»/«رد»، نه اعمال بی‌صدا.
   * توجه: closestDeparture متن آزاد شمسیِ بی‌سال است («۲۴ شهریور»)، پس «گذشته»
   * نسبت به همین سال شمسیِ جاری سنجیده می‌شود.
   */
  const parseDeparture = (text: string): { day: number; month: number } | null => {
    const m = en((text || '').trim()).match(/(\d{1,2})\s*(.+)/);
    if (!m) return null;
    const day = Number(m[1]);
    const token = m[2].replace(/[‌\s]/g, '');
    const month =
      JALALI_MONTHS.findIndex((n) => n === token || n.startsWith(token) || token.startsWith(n)) + 1;
    if (!day || day < 1 || day > 31 || month < 1) return null;
    return { day, month };
  };
  const origDeparture = (tour.closestDeparture || '').trim();
  const parsedOrig = parseDeparture(origDeparture);
  const todayJ = toJalali(new Date());
  const origIsPast =
    parsedOrig !== null &&
    (parsedOrig.month < todayJ.jm || (parsedOrig.month === todayJ.jm && parsedOrig.day < todayJ.jd));
  const safeCandidate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    let c = formatJalali(d, { weekday: false, year: false });
    // پیشنهاد نباید با تاریخ تور اصلی یکی باشد.
    if (c === origDeparture) {
      d.setDate(d.getDate() + 1);
      c = formatJalali(d, { weekday: false, year: false });
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origDeparture]);
  const [dismissedSafeDate, setDismissedSafeDate] = useState(false);
  const showSafeDate = !dismissedSafeDate && (!parsedOrig || origIsPast);

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
      setSlugError('آدرس اینترنتی لازم است.');
      ok = false;
    }
    // قلم ۳ موج ۰: قیمت نسخهٔ تازه یا همان قیمت مبدأ است (انتخاب صریح) یا عددی
    // که مدیر همین‌جا وارد می‌کند؛ قیمت نامعتبر، تکثیر را نگه می‌دارد.
    // منبع تکثیر: ردیف کامل (غنی/سئو هم می‌آید). دکمه تا رسیدن پاسخ getTourById
    // غیرفعال است؛ فقط اگر خوانش خطا بخورد همان ردیف فهرست مبناست.
    const source: TourRow & Partial<TourRichFields> = fullTour ?? tour;
    let newPrice = source.price;
    if (priceMode === 'custom') {
      const v = Number(customPrice) || 0;
      if (v <= 0) {
        setPriceError('قیمت معتبر وارد کنید.');
        ok = false;
      } else {
        newPrice = v;
      }
    }
    if (!ok) return;
    setBusy(true);
    try {
      const unique = await checkSlugUnique(cleanSlug);
      if (!unique.unique) {
        setSlugError('این آدرس اینترنتی قبلاً برای تور دیگری استفاده شده است.');
        setBusy(false);
        return;
      }
      const result = await saveTour(null, {
        ...source,
        title: cleanTitle,
        slug: cleanSlug,
        closestDeparture: departure.trim(),
        // تکثیر همیشه پیش‌نویس است — نیت 'draft' تا گیت انتشار درگیر نشود.
        publishStatus: 'draft',
        // ظرفیت کپی نامشخص است — نه «تأییدشده».
        status: 'pending',
        statusLabel: 'در انتظار تأیید ظرفیت',
        price: newPrice,
        // قلم ۳ موج ۰: نشان «حرکت تضمین‌شده» قول حقوقی است؛ چون ظرفیت نسخهٔ
        // تازه «در انتظار تأیید» است، خاموش می‌ماند و منتقل نمی‌شود.
        badge: source.badge === 'حرکت تضمین‌شده' ? '' : source.badge,
      }, 'draft');
      // خطای قابل‌پیش‌بینی به‌صورت مقدار برمی‌گردد تا پیام واقعی‌اش در پروداکشن
      // پشت #441 گم نشود (ریشهٔ مشترک bugfix-441).
      // نکته: این پروژه strict:false است و narrow روی !result.ok کار نمی‌کند؛ پس === false صریح.
      if (result.ok === false) {
        toast({
          title: 'کپی ناموفق بود',
          description: result.error,
          variant: 'error',
        });
        setBusy(false);
        return;
      }
      toast({
        title: 'تور کپی شد',
        description: `«${cleanTitle}» به‌صورت پیش‌نویس ساخته شد؛ مبدأ و ویزا از تور اصلی حفظ شدند.`,
      });
      onDone(result.id);
    } catch (e) {
      const digest = e instanceof Error ? (e as { digest?: string }).digest : undefined;
      console.error('[tour-duplicate] unexpected error', digest ? { digest } : e);
      toast({
        title: 'کپی ناموفق بود',
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
      title="کپی تور"
      description={`از «${tour.title}» یک کپی می‌گیرید. مبدأ و ویزا از تور اصلی حفظ می‌شوند؛ قیمت را همین‌جا انتخاب می‌کنید و نشان «حرکت تضمین‌شده» به کپی منتقل نمی‌شود. کپی به‌صورت پیش‌نویس ساخته می‌شود.`}
      footer={
        <>
          <Button size="md" disabled={busy || !fullLoaded} onClick={() => void submit()} className="gap-2">
            <Copy className="size-4" />
            {busy ? 'در حال کپی…' : !fullLoaded ? 'در حال بارگذاری…' : 'کپی تور'}
          </Button>
          <Button size="md" variant="outline" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="عنوان تور جدید" htmlFor="dup-title" error={titleError}>
          <Input className="max-md:text-base"
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
            label="آدرس اینترنتی"
            htmlFor="dup-slug"
            hint="آدرس صفحهٔ همین تور در سایت؛ خودکار از عنوان ساخته می‌شود و اگر خواستید می‌توانید دستی عوضش کنید"
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
              className="font-mono max-md:text-base"
            />
          </Field>
          <button
            type="button"
            onClick={rebuildSlugFromTitle}
            className="mt-1.5 inline-flex items-center gap-1 text-caption font-bold text-brand hover:underline"
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
        {/* قلم ۵ موج ۲: اگر تاریخ تور اصلی گذشته یا خوانا نیست، تاریخ امن پیشنهاد می‌شود. */}
        {showSafeDate && (
          <SmartSuggestion
            title={`تاریخ امن پیشنهادی: ${safeCandidate}`}
            description={
              origIsPast
                ? `تاریخ حرکت تور اصلی («${origDeparture}») گذشته است. این تاریخ نه در گذشته است و نه با تاریخ تور اصلی یکی.`
                : `تاریخ حرکت تور اصلی${origDeparture ? ` («${origDeparture}») ` : ' '}خوانا نیست. این پیشنهاد در آینده است و با تاریخ تور اصلی یکی نیست.`
            }
            onAccept={() => {
              setDeparture(safeCandidate);
              setDismissedSafeDate(true);
              toast({ title: 'تاریخ امن گذاشته شد' });
            }}
            onReject={() => setDismissedSafeDate(true)}
          />
        )}
        <dl className="space-y-1.5 rounded-sm border border-border/70 bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">مبدأ (حفظ می‌شود)</dt>
            <dd className="font-medium text-foreground">{tour.origin || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">ویزا (حفظ می‌شود)</dt>
            <dd className="font-medium text-foreground">{tour.visaRequired ? 'لازم است' : 'لازم نیست'}</dd>
          </div>
          {/* قلم ۳ موج ۰: قیمت مبدأ دیده می‌شود و انتخابش پایین صریح است؛
              نشان «حرکت تضمین‌شده» هم به نسخهٔ تازه منتقل نمی‌شود. */}
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">قیمت تور مبدأ</dt>
            <dd className="font-medium text-foreground">{formatToman(tour.price)}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">نشان «حرکت تضمین‌شده»</dt>
            <dd className="font-medium text-foreground">به کپی منتقل نمی‌شود</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">وضعیت کپی</dt>
            <dd className="font-medium text-foreground">پیش‌نویس</dd>
          </div>
        </dl>
        {/* قلم ۳ موج ۰: انتخاب صریح قیمت نسخهٔ تازه — دیگر کپیِ بی‌صدا نیست. */}
        <fieldset>
          <legend className="text-xs font-bold text-foreground">قیمت کپی</legend>
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-border/70 bg-card p-3 text-xs transition-colors hover:border-foreground/30">
              <input
                type="radio"
                name="dup-price-mode"
                checked={priceMode === 'keep'}
                onChange={() => { setPriceMode('keep'); setPriceError(''); }}
                className="size-4 shrink-0 cursor-pointer accent-brand"
              />
              <span className="font-medium text-foreground">همین قیمت بماند</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-border/70 bg-card p-3 text-xs transition-colors hover:border-foreground/30">
              <input
                type="radio"
                name="dup-price-mode"
                checked={priceMode === 'custom'}
                onChange={() => setPriceMode('custom')}
                className="size-4 shrink-0 cursor-pointer accent-brand"
              />
              <span className="font-medium text-foreground">خودم وارد می‌کنم</span>
            </label>
          </div>
          {priceMode === 'custom' && (
            <div className="mt-3">
              <Field label="قیمت نسخهٔ تازه" error={priceError}>
                <AmountInput inputClassName="max-md:text-base"
                  value={customPrice}
                  onChange={(v) => { setCustomPrice(v); setPriceError(''); }}
                  placeholder="۰"
                />
              </Field>
            </div>
          )}
        </fieldset>
      </div>
    </Dialog>
  );
}
