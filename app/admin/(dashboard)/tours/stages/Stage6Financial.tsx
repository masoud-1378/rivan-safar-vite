'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Table2,
  Plus,
  Trash2,
  FileText,
  Banknote,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { cn, fa } from '@/lib/utils';
import type { TourCancellationTier, TourFinancialSpecsItem, TourInput } from '../actions';
import { checkPublishReadiness } from '../publish-gate';
import { SmartSuggestion } from '../SmartSuggestion';
import { getVisaRejectionSuggestion, type VisaRejectionSuggestion } from '../suggestions';

interface Stage6FinancialProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  /** شناسهٔ تور در حال ویرایش؛ پیشنهادها خودش را منبع حساب نمی‌کنند. */
  excludeTourId?: string | null;
}

/**
 * متن مرجع بند «تکلیف پول در صورت رد ویزا» — فقط مبنای مقایسه برای پیشنهاد
 * هوشمند است (پیشنهاد فقط وقتی می‌آید که بند خالی یا همین متن باشد). از پیش
 * در textarea گذاشته نمی‌شود: خالی = خالی (قانون طلایی مالی).
 */
export const DEFAULT_VISA_REJECTION_NOTE =
  'در صورت رد ویزا از سوی سفارت، هزینهٔ ویزا و خدمات انجام‌شده غیرقابل استرداد است و بقیهٔ مبالغ پرداخت‌شده به مسافر برمی‌گردد.';

/**
 * الگوی پیشنهادی جدول کنسلی پلکانی (رویهٔ رایج تورهای ایرانی) — فقط با کلیک
 * صریح مدیر روی «الگوی پیشنهادی» می‌آید، نه خودکار: قانون طلایی مالی می‌گوید
 * هیچ عددی بدون دست مدیر وارد فرم نمی‌شود. مدیر همهٔ ردیف‌ها را عوض می‌کند.
 */
const STARTER_TIERS: TourCancellationTier[] = [
  { fromDays: 30, toDays: 15, penaltyPercent: 10 },
  { fromDays: 14, toDays: 7, penaltyPercent: 30 },
  { fromDays: 6, toDays: 2, penaltyPercent: 50 },
  { fromDays: 1, toDays: 0, penaltyPercent: 100 },
];

/** پله کامل: هر سه عدد (از/تا/درصد) واقعاً وارد شده و معتبرند — همان منطق گیت انتشار.
 *  typeof چک می‌شود چون Number(null) برابر ۰ است و پلهٔ خالیِ دست‌نخورده را
 *  «کامل» نشان می‌داد (باگ ۱۴۰۵/۰۷/۱۱). */
function isCompleteTier(t: TourCancellationTier): boolean {
  const from = t?.fromDays;
  const to = t?.toDays;
  const p = t?.penaltyPercent;
  return (
    typeof from === 'number' && Number.isFinite(from) && from >= 0 &&
    typeof to === 'number' && Number.isFinite(to) && to >= 0 &&
    typeof p === 'number' && Number.isFinite(p) && p >= 0 && p <= 100
  );
}

export default function Stage6Financial({ data, onChange, excludeTourId }: Stage6FinancialProps) {
  const fin: TourFinancialSpecsItem = data.financialSpecs ?? {};
  const tiers = Array.isArray(fin.cancellationTiers) ? fin.cancellationTiers : [];
  const { toast } = useToast();

  /**
   * پیشنهاد هوشمند بند رد ویزا (موج ۳): از تورهای قبلی همین مقصدها — فقط
   * وقتی که بندِ فرم هنوز خالی است یا همان متن پیش‌فرض شروع را دارد.
   * بی‌داده خفته می‌ماند؛ تا «پذیرفتن» زده نشود هیچ‌چیز عوض نمی‌شود.
   */
  const [visaSuggestion, setVisaSuggestion] = useState<VisaRejectionSuggestion | null>(null);
  const [visaSuggestionOff, setVisaSuggestionOff] = useState(false);
  const currentNote = (fin.visaRejectionNote ?? '').trim();
  const noteUntouched = currentNote === '' || currentNote === DEFAULT_VISA_REJECTION_NOTE.trim();
  const slugsKey = (data.destinationSlugs ?? []).filter(Boolean).join(',');

  useEffect(() => {
    setVisaSuggestionOff(false);
  }, [slugsKey]);

  useEffect(() => {
    if (!noteUntouched || visaSuggestionOff || !slugsKey) {
      setVisaSuggestion(null);
      return;
    }
    let alive = true;
    getVisaRejectionSuggestion(
      slugsKey.split(','),
      excludeTourId ?? null,
      DEFAULT_VISA_REJECTION_NOTE,
    ).then((s) => {
      if (alive) setVisaSuggestion(s);
    });
    return () => {
      alive = false;
    };
  }, [noteUntouched, visaSuggestionOff, slugsKey, excludeTourId]);

  const updateFinancial = (patch: Partial<TourFinancialSpecsItem>) => {
    onChange({ financialSpecs: { ...fin, ...patch } });
  };

  const setTier = (index: number, patch: Partial<TourCancellationTier>) => {
    updateFinancial({
      cancellationTiers: tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    });
  };

  const addTier = () => {
    updateFinancial({ cancellationTiers: [...tiers, { fromDays: null, toDays: null, penaltyPercent: null }] });
  };

  const removeTier = (index: number) => {
    updateFinancial({ cancellationTiers: tiers.filter((_, i) => i !== index) });
  };

  const applyStarter = () => {
    updateFinancial({ cancellationTiers: STARTER_TIERS.map((t) => ({ ...t })) });
    toast({ title: 'الگوی پیشنهادی جدول کنسلی وارد شد؛ همهٔ عددها را با قرارداد واقعی تور عوض کنید.' });
  };

  const [confirmClearTiers, setConfirmClearTiers] = React.useState(false);
  const clearTiers = () => {
    updateFinancial({ cancellationTiers: [] });
  };

  // وضعیت بلوک مالی از همان گیت انتشار می‌آید — منبع یگانه، نه محاسبهٔ جدا.
  const financialCheck = React.useMemo(
    () => checkPublishReadiness(data).checks.find((c) => c.key === 'financial'),
    [data]
  );
  const completeCount = tiers.filter(isCompleteTier).length;

  return (
    <div className="space-y-6">
      {/* Header (T16: الگوی تک‌رنگ با لهجهٔ برند) */}
      {/* تیم ۶ (موج ۶، ایراد ۱۱): به‌جای حکم کلیِ «هنوز کامل نیست»، معیار دقیق
          همان گیت انتشار — دقیقاً کدام قلم کم است — همین‌جا نوشته می‌شود؛
          منبع یگانه است، نه محاسبهٔ جدا. فونت هم از text-panel-* است. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-sm border border-brand/20 bg-brand/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-sm bg-brand text-brand-foreground">
              <Wallet className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">مرحله ششم: هزینه‌ها و شرایط</h3>
              <p className="text-xs text-muted-foreground">
                جدول کنسلی پلکانی، تکلیف پول در صورت رد ویزا، و پیش‌پرداخت — همان چیزی که روی صفحهٔ تور به مسافر نمایش داده می‌شود
              </p>
            </div>
          </div>
          {financialCheck && (
            <span
              className={cn(
                'hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-panel-caption font-bold',
                financialCheck.ok
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-600'
              )}
            >
              {financialCheck.ok ? <Check className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              {financialCheck.ok ? 'بلوک مالی کامل است' : 'بلوک مالی ناقص است'}
            </span>
          )}
        </div>
        {financialCheck && !financialCheck.ok && (
          <p className="px-1 text-panel-caption leading-5 text-amber-600">
            {financialCheck.message}
          </p>
        )}
      </div>

      {/* قانون طلایی مالی */}
      <div className="flex items-start gap-2.5 rounded-sm border border-amber-500/40 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-5 text-foreground">
          <span className="font-bold">قانون طلایی:</span> هیچ عددی حدس زده نمی‌شود.
          همهٔ عددهای این مرحله را خودتان تایپ کنید؛ هرچه خالی بماند، روی صفحهٔ تور
          هم چیزی نمایش داده نمی‌شود. برای انتشار، دست‌کم «یک پلهٔ کنسلیِ کامل»
          + «بند رد ویزا» + «مبلغ یا درصد پیش‌پرداخت» لازم است.
        </p>
      </div>

      {/* Cancellation tiers table */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Table2 className="size-4 text-brand" />
            <span>جدول کنسلی پلکانی</span>
          </h4>
          <span className="text-caption text-muted-foreground">
            پله‌ای کامل است که هر سه عددش وارد شده باشد ({fa(completeCount)} پلهٔ کامل)
          </span>
        </div>

        {tiers.length === 0 && (
          <div className="rounded-sm border border-dashed border-border bg-secondary/20 p-4">
            <p className="text-xs text-muted-foreground leading-5">
              هنوز پله‌ای ثبت نشده است. می‌توانید از الگوی پیشنهادی (رویهٔ رایج تورهای ایرانی)
              شروع کنید و بعد همهٔ عددها را با قرارداد واقعی این تور عوض کنید — یا خودتان
              ردیف‌به‌ردیف بسازید.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={applyStarter} className="mt-3 gap-1.5 text-xs">
              <Plus className="size-4" />
              درج الگوی پیشنهادی (قابل‌ویرایش)
            </Button>
            <p className="mt-2 text-caption text-muted-foreground">
              این الگو فقط یک نقطهٔ شروع است؛ هیچ‌کدام از عددهایش نهایی نیست و همه را می‌توانید عوض کنید.
            </p>
          </div>
        )}

        {tiers.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_44px] gap-2 px-1 text-caption font-bold text-muted-foreground">
                <span>از چند روز مانده به حرکت</span>
                <span>تا چند روز مانده به حرکت</span>
                <span>درصد جریمه</span>
                <span />
              </div>
              {tiers.map((tier, idx) => {
                const complete = isCompleteTier(tier);
                return (
                  <div
                    key={idx}
                    className={cn(
                      'grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_44px] gap-2 rounded-sm border p-3 sm:p-2',
                      complete ? 'border-border/70 bg-secondary/15' : 'border-amber-500/50 bg-amber-500/5'
                    )}
                  >
                    <div>
                      <label className="mb-1 block text-caption text-muted-foreground sm:hidden">از چند روز مانده به حرکت</label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={tier.fromDays ?? ''}
                        onChange={(e) =>
                          setTier(idx, {
                            fromDays: e.target.value === '' ? null : Math.max(0, Math.round(Number(e.target.value) || 0)),
                          })
                        }
                        placeholder="مثلاً: ۳۰"
                        className="text-xs max-md:text-base"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-caption text-muted-foreground sm:hidden">تا چند روز مانده به حرکت</label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={tier.toDays ?? ''}
                        onChange={(e) =>
                          setTier(idx, {
                            toDays: e.target.value === '' ? null : Math.max(0, Math.round(Number(e.target.value) || 0)),
                          })
                        }
                        placeholder="مثلاً: ۱۵"
                        className="text-xs max-md:text-base"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-caption text-muted-foreground sm:hidden">درصد جریمه</label>
                      <div className="relative">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={tier.penaltyPercent ?? ''}
                          onChange={(e) =>
                            setTier(idx, {
                              penaltyPercent:
                                e.target.value === ''
                                  ? null
                                  : Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                            })
                          }
                          placeholder="مثلاً: ۱۰"
                          className="text-xs max-md:text-base ps-10"
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">٪</span>
                      </div>
                    </div>
                    <div className="flex sm:items-center sm:justify-center">
                      <button
                        type="button"
                        onClick={() => removeTier(idx)}
                        aria-label={`حذف پلهٔ ${fa(idx + 1)}`}
                        title="حذف این پله"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {!complete && (
                      <p className="text-caption text-amber-600 sm:col-span-4">
                        این پله هنوز کامل نیست؛ هر سه عدد را وارد کنید تا در انتشار حساب شود.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addTier} className="gap-1.5 text-xs">
                <Plus className="size-4" />
                افزودن پله
              </Button>
              <button
                type="button"
                onClick={() => setConfirmClearTiers(true)}
                className="text-caption font-bold text-muted-foreground hover:text-destructive hover:underline"
              >
                پاک کردن همهٔ پله‌ها
              </button>
            </div>
          </>
        )}
      </div>

      {/* Visa rejection clause */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-brand" />
          <span>تکلیف پول در صورت رد ویزا</span>
        </h4>
        <p className="text-caption text-muted-foreground leading-5">
          متن زیر فقط یک پیشنهاد برای شروع است؛ دقیقاً با همان قرارداد این تور بازنویسی‌اش کنید.
        </p>
        {visaSuggestion && !visaSuggestionOff && (
          <SmartSuggestion
            title="بند رد ویزا از تور قبلی همین مقصد"
            description={
              <>
                <span className="text-foreground">«{visaSuggestion.note}»</span>
                <br />
                <span>از تور «{visaSuggestion.tourTitle}»</span>
              </>
            }
            onAccept={() => {
              updateFinancial({ visaRejectionNote: visaSuggestion.note });
              setVisaSuggestionOff(true);
            }}
            onReject={() => setVisaSuggestionOff(true)}
          />
        )}
        <textarea
          value={fin.visaRejectionNote ?? ''}
          onChange={(e) => updateFinancial({ visaRejectionNote: e.target.value })}
          rows={4}
          placeholder="مثلاً: در صورت رد ویزا، هزینهٔ ویزا غیرقابل استرداد است و …"
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-xs max-md:text-base leading-6 text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Deposit */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Banknote className="size-4 text-brand" />
          <span>پیش‌پرداخت و مهلت تسویه</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Field label="مبلغ یا درصد پیش‌پرداخت" hint="برای انتشار لازم است — فقط همان چیزی که مدیر می‌نویسد">
              <Input className="max-md:text-base"
                value={fin.depositAmount ?? ''}
                onChange={(e) => updateFinancial({ depositAmount: e.target.value })}
                placeholder="مثلاً: ۲۰٪ از مبلغ تور"
              />
            </Field>
          </div>
          <div>
            <Field label="مهلت تسویه" hint="خوب است باشد؛ برای انتشار لازم نیست">
              <Input className="max-md:text-base"
                value={fin.depositDeadline ?? ''}
                onChange={(e) => updateFinancial({ depositDeadline: e.target.value })}
                placeholder="مثلاً: ۷ روز قبل از حرکت"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* دیالوگ تأیید پاک‌کردن جدول (C4-3): پله‌های دستیِ تایپ‌شده یک‌کلیکی پاک می‌شود و راه برگشتی نیست. */}
      <AlertDialog
        open={confirmClearTiers}
        onOpenChange={setConfirmClearTiers}
        title="همهٔ پله‌های جدول کنسلی پاک شود؟"
        description="پله‌هایی که خودتان نوشته‌اید همه پاک می‌شود؛ این کار قابل بازگشت نیست."
        confirmText="پاک کردن جدول"
        cancelText="انصراف"
        destructive
        onConfirm={clearTiers}
      />
    </div>
  );
}
