'use client';

import React from 'react';
import { 
  Headphones, 
  UserCheck, 
  PhoneCall, 
  Mic, 
  CheckCircle, 
  Sparkles,
  LifeBuoy,
  FileCheck2
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { TourConsultantSpecItem, TourInput } from '../actions';

interface Stage5ConsultantProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'منتشر شده (قابل رزرو روی سایت)' },
  { value: 'pending', label: 'پیش‌نویس (فقط قابل رویت در ادمین)' },
  { value: 'archived', label: 'بایگانی‌شده (تکمیل ظرفیت یا منقضی)' },
];

export default function Stage5Consultant({ data, onChange }: Stage5ConsultantProps) {
  const consultant = data.consultantSpec || {};

  const updateConsultant = (patch: Partial<TourConsultantSpecItem>) => {
    onChange({
      consultantSpec: {
        ...consultant,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-600 text-white">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله پنجم: کارشناس تخصصی، پادکست صوتی و وضعیت انتشار</h3>
            <p className="text-xs text-muted-foreground">
              افزودن لمس انسانی (Human Touch)، کارت مشاور مستقیم مسیر با شماره داخلی، ویس راهنما و وضعیت نهایی تور
            </p>
          </div>
        </div>
      </div>

      {/* Consultant Card Details */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <UserCheck className="size-4 text-purple-600" />
            <span>مشخصات کارشناس اختصاصی این مسیر گردشگری</span>
          </h4>
          <span className="text-[11px] text-muted-foreground">در پایین صفحه تور و باکس مشاوره مستقیم نمایش داده می‌شود</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Field label="نام و نام خانوادگی کارشناس" hint="مثال: سحر راد، میلاد محمدی">
              <Input
                value={consultant.name || ''}
                onChange={(e) => updateConsultant({ name: e.target.value })}
                placeholder="نام کارشناس…"
              />
            </Field>
          </div>

          <div>
            <Field label="عنوان شغلی یا سمت" hint="مثال: سرپرست تورهای اروپا">
              <Input
                value={consultant.title || ''}
                onChange={(e) => updateConsultant({ title: e.target.value })}
                placeholder="عنوان کارشناس…"
              />
            </Field>
          </div>

          <div>
            <Field label="شماره تلفن مستقیم یا شماره داخلی" hint="مثال: 021-91000000 داخلی 204">
              <Input
                dir="ltr"
                value={consultant.phone || ''}
                onChange={(e) => updateConsultant({ phone: e.target.value })}
                placeholder="021-xxxxxxxx ext 200"
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <Field label="شماره تماس اضطراری یا پشتیبانی ۲۴ ساعته در سفر" hint="شماره همراه پشتیبان در کشور مقصد">
              <Input
                dir="ltr"
                value={consultant.emergencyPhone || ''}
                onChange={(e) => updateConsultant({ emergencyPhone: e.target.value })}
                placeholder="+98912xxxxxxx"
              />
            </Field>
          </div>

          <div>
            <Field label="لینک فایل صوتی یا پادکست معرفی تور (اختیاری)" hint="مسافر می‌تواند وویس مشاور را در صفحه تور بشنود">
              <div className="relative">
                <Input
                  dir="ltr"
                  value={consultant.audioUrl || ''}
                  onChange={(e) => updateConsultant({ audioUrl: e.target.value })}
                  placeholder="https://rivansafar.com/audio/..."
                  className="pl-9"
                />
                <Mic className="size-4 text-purple-500 absolute left-3 top-2.5" />
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Description / Summary textarea */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="size-4 text-brand" />
          <span>توضیحات کلی، مقدمه سفر و نکات تکمیلی</span>
        </h4>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="روایت جذاب و صادقانه از حال و هوای سفر، تجربیات خاص این مسیر و چرایی انتخاب این پکیج توسط مسافر…"
          className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Publishing Status */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <span>وضعیت نهایی تور</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Field label="وضعیت انتشار">
              <Select
                value={data.status}
                onChange={(e) => {
                  const val = e.target.value;
                  const opt = STATUS_OPTIONS.find((s) => s.value === val);
                  onChange({ status: val, statusLabel: opt?.label || val });
                }}
                options={STATUS_OPTIONS}
              />
            </Field>
          </div>

          <div className="flex flex-col justify-center rounded-xl bg-secondary/30 p-4 border border-border/60">
            <span className="text-xs font-bold text-foreground">راهنمای وضعیت</span>
            <p className="text-[11px] text-muted-foreground mt-1">
              در وضعیت «منتشر شده»، تور فوراً در لیست تورهای عمومی سایت و فیلترهای جستجو قرار می‌گیرد. در حالت «پیش‌نویس»، فقط مدیران در این پنل می‌توانند آن را ببینند و ویرایش کنند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
