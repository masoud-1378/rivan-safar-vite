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
import { cn } from '@/lib/utils';
import type { TourTrustSpecsItem, TourInput } from '../actions';

interface Stage4TrustTermsProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

const COMMON_DOCS = [
  'پاسپورت با حداقل ۶ ماه اعتبار از تاریخ سفر',
  'کارت ملی و شناسنامه کلیه مسافران',
  'دو قطعه عکس ۴*۳ زمینه سفید جدید',
  'پرینت حساب بانکی و تمکن مالی ۶ ماهه',
  'ضمانت‌نامه بانکی بازگشت از سفر',
  'گواهی اشتغال به کار یا جواز کسب معتبر',
  'رضایت‌نامه محضری خروج برای افراد زیر ۱۸ سال',
];

const ACTIVITY_LEVELS = [
  { id: 'easy', label: 'سبک و استراحتی', desc: 'مناسب تمام سنین و بدون پیاده‌روی سنگین' },
  { id: 'moderate', label: 'متوسط (پیاده‌روی معمول شهری)', desc: 'روزانه ۱ الی ۳ ساعت گشت و پیاده‌روی' },
  { id: 'demanding', label: 'پرتحرک و ماجراجویانه', desc: 'نیازمند آمادگی جسمانی، کوهپیمایی یا پله' },
];

export default function Stage4TrustTerms({ data, onChange }: Stage4TrustTermsProps) {
  const trust = data.trustSpecs || {};
  const currentDocs = trust.requiredDocs || (data.visaRequired ? [
    'پاسپورت با حداقل ۶ ماه اعتبار',
    'دو قطعه عکس رنگی جدید',
    'گواهی تمکن مالی به لاتین'
  ] : [
    'کارت ملی هوشمند یا شناسنامه'
  ]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-600 text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله چهارم: سپر اعتماد، مدارک و شفاف‌سازی قوانین</h3>
            <p className="text-xs text-muted-foreground">
              افزایش امنیت خاطر مسافر با اعلام صریح مدارک، وضعیت ویزا، هزینه‌های احتمالی در مقصد (مالیات شهری، انعام) و بار مجاز
            </p>
          </div>
        </div>
      </div>

      {/* Visa & Guarantee Section */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-brand" />
          <span>وضعیت ویزا و ضمانت‌نامه بازگشت</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visa Requirement toggle */}
          <div className="flex flex-col justify-center rounded-xl border border-border/80 bg-secondary/20 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.visaRequired}
                onChange={(e) => onChange({ visaRequired: e.target.checked })}
                className="size-4 accent-brand rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-foreground block">نیاز به دریافت ویزا</span>
                <span className="text-[11px] text-muted-foreground">آیا مسافر برای این سفر نیازمند اخذ ویزا است؟</span>
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
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Coins className="size-4 text-amber-500" />
          <span>شفاف‌سازی هزینه‌های محلی مقصد و بار مجاز مسافر</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Field label="مالیات شهری هتل (City Tax)" hint="در برخی کشورها مسافر مستقیماً به هتل پرداخت می‌کند">
              <Input
                value={trust.cityTax || ''}
                onChange={(e) => updateTrust({ cityTax: e.target.value })}
                placeholder="مثلاً: شبی ۲ الی ۵ یورو"
              />
            </Field>
          </div>

          <div>
            <Field label="انعام راننده و لیدر (Tips)" hint="عرف پرداخت انعام در مقصد مورد نظر">
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
                  placeholder="مثلاً: 30"
                  className="pl-14"
                />
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">کیلوگرم</span>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Activity Level Selector */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
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
                  "p-3 rounded-xl border text-right transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
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
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-blue-500" />
            <span>مدارک لازم برای ثبت‌نام و ویزا</span>
          </h4>
          <span className="text-[11px] text-muted-foreground">روی صفحه تور به عنوان چک‌لیست نمایش داده می‌شود</span>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-[11px] text-muted-foreground block mb-1.5">پیشنهادات سریع برای افزودن:</span>
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
                    "text-[11px] rounded-lg border px-2 py-1 transition-colors text-right",
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
          <Button type="button" size="sm" onClick={() => addDoc(customDoc)} className="text-xs">
            افزودن مدرک
          </Button>
        </div>

        {/* Selected docs list */}
        <div className="space-y-1.5 pt-2">
          {currentDocs.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/15 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Check className="size-3.5 text-emerald-500" />
                <span>{doc}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(idx)}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
