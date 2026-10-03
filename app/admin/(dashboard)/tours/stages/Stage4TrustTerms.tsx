'use client';

import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  HelpCircle, 
  Coins, 
  Luggage, 
  Activity, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { cn, fa } from '@/lib/utils';
import type { TourTrustSpecsItem, TourInput, TourDocsSuggestion } from '../actions';
import { getTourDocsSuggestion } from '../actions';

interface Stage4TrustTermsProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  /** شناسهٔ تور در حال ویرایش؛ پیشنهادها خودش را منبع حساب نمی‌کنند. */
  excludeTourId?: string | null;
}

const COMMON_DOCS = [
  'پاسپورت با حداقل ۶ ماه اعتبار از تاریخ سفر',
  'کارت ملی و شناسنامه همهٔ مسافران',
  'دو قطعه عکس ۴×۳ زمینه سفید جدید',
  'پرینت حساب بانکی و تمکن مالی ۶ ماهه',
  'ضمانت‌نامه بانکی بازگشت از سفر',
  'گواهی اشتغال به کار یا جواز کسب معتبر',
  'رضایت‌نامه محضری خروج برای افراد زیر ۱۸ سال',
];

const ACTIVITY_LEVELS = [
  { id: 'easy', label: 'سبک و استراحتی', desc: 'مناسب تمام سنین و بدون پیاده‌روی سنگین' },
  { id: 'moderate', label: 'متوسط (پیاده‌روی معمول شهری)', desc: 'روزانه ۱ تا ۳ ساعت گشت و پیاده‌روی' },
  { id: 'demanding', label: 'پرتحرک و ماجراجویانه', desc: 'نیازمند آمادگی جسمانی، کوهپیمایی یا پله' },
];

export default function Stage4TrustTerms({ data, onChange, excludeTourId }: Stage4TrustTermsProps) {
  const trust = data.trustSpecs || {};
  // مدارک پیش‌فرض بر اساس نیاز به ویزا (X12): منبع یگانه‌ای که هم fallback و هم «بازنشانی» از آن می‌خواند.
  const defaultDocsForVisa = (visaRequired: boolean): string[] =>
    visaRequired ? [
      'پاسپورت با حداقل ۶ ماه اعتبار',
      'دو قطعه عکس رنگی جدید',
      'گواهی تمکن مالی به لاتین'
    ] : [
      'کارت ملی هوشمند یا شناسنامه'
    ];
  const currentDocs = trust.requiredDocs || defaultDocsForVisa(!!data.visaRequired);
  const { toast } = useToast();

  const updateTrust = (patch: Partial<TourTrustSpecsItem>) => {
    onChange({
      trustSpecs: {
        ...trust,
        ...patch,
      },
    });
  };

  const [customDoc, setCustomDoc] = React.useState('');

  const addDoc = (docText: string) => {
    if (!docText.trim() || currentDocs.includes(docText.trim())) return;
    updateTrust({ requiredDocs: [...currentDocs, docText.trim()] });
    setCustomDoc('');
  };

  const removeDoc = (index: number) => {
    updateTrust({ requiredDocs: currentDocs.filter((_, i) => i !== index) });
  };

  // بازنشانی مدارک بر اساس ویزا (X12): فهرست را به همان پیش‌فرض‌های ویزایی برمی‌گرداند.
  // دیالوگ تأیید (C4-3): مدارک دستیِ تایپ‌شده با یک کلیک پاک می‌شود و راه برگشتی نیست.
  const [confirmResetDocs, setConfirmResetDocs] = React.useState(false);

  /**
   * قلم ۳ موج ۲: مدارک تور قبلی همین مقصد — قانون طلایی: دکمه می‌آوردشان و
   * مدیر در دیالوگ تیک می‌زند کدام‌ها بیایند؛ هیچ‌چیز بی‌صدا اضافه نمی‌شود.
   * اگر تور قبلی‌ای مدرکی نداشته باشد، دکمه اصلاً دیده نمی‌شود (دادهٔ فعلی:
   * هیچ توری مدرک ثبت‌شده ندارد، پس این قلم فعلاً خفته است).
   */
  const singleDestSlug = Array.isArray(data.destinationSlugs) && data.destinationSlugs.length === 1
    ? data.destinationSlugs[0]
    : null;
  const [docsSuggestion, setDocsSuggestion] = React.useState<TourDocsSuggestion | null>(null);
  const [showDocsPicker, setShowDocsPicker] = React.useState(false);
  const [pickedDocs, setPickedDocs] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!singleDestSlug) {
      setDocsSuggestion(null);
      return;
    }
    let alive = true;
    getTourDocsSuggestion(singleDestSlug, excludeTourId ?? null)
      .then((s) => {
        if (alive) setDocsSuggestion(s);
      })
      .catch(() => {
        if (alive) setDocsSuggestion(null);
      });
    return () => {
      alive = false;
    };
  }, [singleDestSlug, excludeTourId]);

  const openDocsPicker = () => {
    setPickedDocs(docsSuggestion?.docs ?? []);
    setShowDocsPicker(true);
  };
  const applyPickedDocs = () => {
    if (pickedDocs.length === 0) {
      setShowDocsPicker(false);
      return;
    }
    const fresh = pickedDocs.filter((d) => !currentDocs.includes(d));
    if (fresh.length > 0) {
      updateTrust({ requiredDocs: [...currentDocs, ...fresh] });
      toast({ title: `${fa(fresh.length)} مدرک اضافه شد` });
    }
    setShowDocsPicker(false);
  };
  const resetDocsToVisaDefaults = () => {
    const defaults = defaultDocsForVisa(!!data.visaRequired);
    updateTrust({ requiredDocs: defaults });
    toast({
      title: `مدارک به پیش‌فرض برگشت (${data.visaRequired ? 'سفر با ویزا' : 'سفر بدون ویزا'})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header (T16: الگوی تک‌رنگ با لهجهٔ برند) */}
      <div className="flex items-center justify-between rounded-sm border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله چهارم: مدارک، قوانین و اعتماد مسافر</h3>
            <p className="text-xs text-muted-foreground">
              تا مسافر با خیال راحت ثبت‌نام کند: مدارک لازم، وضعیت ویزا، هزینه‌هایی که خودش در مقصد می‌پردازد (مالیات شهری، انعام) و بار مجاز
            </p>
          </div>
        </div>
      </div>

      {/* Visa & Guarantee Section */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-brand" />
          <span>وضعیت ویزا و ضمانت‌نامه بازگشت</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visa Requirement toggle */}
          <div className="flex flex-col justify-center rounded-sm border border-border/80 bg-secondary/20 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.visaRequired}
                onChange={(e) => onChange({ visaRequired: e.target.checked, visaRequiredManual: true })}
                className="size-4 accent-brand rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-foreground block">نیاز به دریافت ویزا</span>
                <span className="text-[11px] text-muted-foreground">این سفر به ویزا نیاز دارد؟ اگر دست نزنید، بر اساس داخلی یا خارجی بودن مقصد خودش تنظیم می‌شود.</span>
              </div>
            </label>
          </div>

          {/* Return Guarantee */}
          <div>
            <Field label="ضمانت‌نامه بازگشت از سفر" hint="مثال: ضمانت‌نامه بانکی یا چک صیادی به مبلغ ۱۰۰ میلیون تومان">
              <Input
                value={trust.returnGuarantee || ''}
                onChange={(e) => updateTrust({ returnGuarantee: e.target.value })}
                placeholder="بدون نیاز به ضمانت‌نامه، یا مبلغ ضمانت…"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Destination Hidden Fees & Luggage */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Coins className="size-4 text-amber-500" />
          <span>شفاف‌سازی هزینه‌های محلی مقصد و بار مجاز مسافر</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Field label="مالیات شهری هتل" hint="در برخی کشورها مسافر مستقیماً به هتل پرداخت می‌کند">
              <Input
                value={trust.cityTax || ''}
                onChange={(e) => updateTrust({ cityTax: e.target.value })}
                placeholder="مثلاً: شبی ۲ تا ۵ یورو"
              />
            </Field>
          </div>

          <div>
            <Field label="انعام راننده و لیدر" hint="عرف پرداخت انعام در مقصد مورد نظر">
              <Input
                value={trust.tipsNote || ''}
                onChange={(e) => updateTrust({ tipsNote: e.target.value })}
                placeholder="مثلاً: روزانه ۵ دلار اختیاری"
              />
            </Field>
          </div>

          <div>
            <Field label="میزان بار مجاز مسافر (کیلوگرم)" hint="بر اساس قوانین ایرلاین یا شرکت حمل‌ونقل">
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  value={trust.luggageKg || ''}
                  onChange={(e) => updateTrust({ luggageKg: Number(e.target.value) || 0 })}
                  placeholder="مثلاً: ۳۰"
                  className="ps-14"
                />
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">کیلوگرم</span>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Activity Level Selector */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Activity className="size-4 text-emerald-500" />
          <span>میزان فعالیت فیزیکی و تناسب سنی تور</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACTIVITY_LEVELS.map((lvl) => {
            const isSelected = (trust.activityLevel || 'easy') === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => updateTrust({ activityLevel: lvl.id })}
                className={cn(
                  "p-3 rounded-sm border text-start transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border/60 bg-secondary/20 hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{lvl.label}</span>
                  {isSelected && <Check className="size-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{lvl.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-blue-500" />
            <span>مدارک لازم برای ثبت‌نام و ویزا</span>
          </h4>
          <span className="text-[11px] text-muted-foreground">روی صفحه تور به عنوان چک‌لیست نمایش داده می‌شود</span>
        </div>

        {/* قلم ۳ موج ۲: اگر تور قبلی همین مقصد مدرکی ثبت کرده باشد، مدیر می‌تواند
            انتخاب کند کدام‌ها به این تور بیایند — هیچ‌چیز بی‌صدا اضافه نمی‌شود. */}
        {docsSuggestion && (
          <button
            type="button"
            onClick={openDocsPicker}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand hover:underline"
          >
            <FileText className="size-3.5" />
            {`افزودن مدارک تور قبلی («${docsSuggestion.title}»)`}
          </button>
        )}

        {/* Quick presets */}
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">پیشنهادهای سریع برای افزودن:</span>
            <button
              type="button"
              onClick={() => setConfirmResetDocs(true)}
              className="text-[11px] font-bold text-brand hover:underline"
            >
              برگرداندن به پیش‌فرض ویزا (نوشته‌های شما پاک می‌شود)
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_DOCS.map((doc, i) => {
              const exists = currentDocs.includes(doc);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={exists}
                  onClick={() => addDoc(doc)}
                  className={cn(
                    "text-[11px] rounded-sm border px-2 py-1 transition-colors text-start",
                    exists
                      ? "border-transparent bg-muted/60 text-muted-foreground/60 cursor-not-allowed"
                      : "border-border/80 bg-secondary/40 text-foreground hover:bg-brand/10 hover:border-brand/40"
                  )}
                >
                  + {doc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom doc input */}
        <div className="flex gap-2">
          <Input
            value={customDoc}
            onChange={(e) => setCustomDoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDoc(customDoc))}
            placeholder="مدرک سفارشی دیگر را تایپ کنید و Enter بزنید…"
            className="text-xs grow"
          />
          <Button type="button" size="sm" onClick={() => addDoc(customDoc)} className="shrink-0 text-xs">
            افزودن مدرک
          </Button>
        </div>

        {/* Selected docs list */}
        <div className="space-y-1.5 pt-2">
          {currentDocs.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-sm border border-border/70 bg-secondary/15 px-3 py-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2 text-foreground font-medium">
                <Check className="size-3.5 shrink-0 text-emerald-500" />
                <span className="truncate">{doc}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(idx)}
                aria-label={`حذف «${doc}»`}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* دیالوگ تأیید بازنشانی مدارک (C4-3): مدارک دستی پاک می‌شود، بدون بازگشت */}
      <AlertDialog
        open={confirmResetDocs}
        onOpenChange={setConfirmResetDocs}
        title="مدارک به حالت پیش‌فرض برگردد؟"
        description="مدارک سفارشی که خودتان نوشته‌اید همه پاک می‌شود و فهرست به پیش‌فرض برمی‌گردد؛ این کار قابل بازگشت نیست."
        confirmText="برگرداندن مدارک"
        destructive
        onConfirm={resetDocsToVisaDefaults}
      />

      {/* قلم ۳ موج ۲: انتخاب مدارک تور قبلی — مدیر تیک می‌زند کدام‌ها بیایند. */}
      <AlertDialog
        open={showDocsPicker}
        onOpenChange={setShowDocsPicker}
        title="کدام مدارک اضافه شوند؟"
        description={docsSuggestion ? (
          <span className="block space-y-1.5 text-start">
            <span className="block text-[11px] text-muted-foreground">{`از تور «${docsSuggestion.title}»:`}</span>
            {docsSuggestion.docs.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-start gap-2 rounded-sm border border-border/60 p-2 text-xs text-foreground"
              >
                <input
                  type="checkbox"
                  checked={pickedDocs.includes(d)}
                  onChange={() => {
                    setPickedDocs((p) =>
                      p.includes(d) ? p.filter((x) => x !== d) : [...p, d]
                    );
                  }}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand"
                />
                <span>{d}</span>
              </label>
            ))}
          </span>
        ) : ''}
        confirmText="افزودن مدارک انتخاب‌شده"
        cancelText="انصراف"
        onConfirm={applyPickedDocs}
      />
    </div>
  );
}
