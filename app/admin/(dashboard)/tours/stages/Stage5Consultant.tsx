'use client';

import React, { useState } from 'react';
import { 
  Headphones, 
  UserCheck, 
  PhoneCall, 
  Mic, 
  CheckCircle, 
  Sparkles,
  LifeBuoy,
  Link2
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { TourConsultantSpecItem, TourInput } from '../actions';

interface Stage5ConsultantProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

export default function Stage5Consultant({ data, onChange }: Stage5ConsultantProps) {
  const consultant = data.consultantSpec || {};
  const { toast } = useToast();
  // پولیش موج ۲: لینک صوتی خام پشت «ویرایش لینک»/«کپی لینک» است؛ پیش‌نمایش پخش‌کننده.
  const [showAudioUrl, setShowAudioUrl] = useState(false);

  const copyAudioLink = async () => {
    const url = (consultant.audioUrl || '').trim();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'لینک فایل صوتی کپی شد' });
    } catch {
      toast({ variant: 'error', title: 'کپی لینک انجام نشد.' });
    }
  };

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
      {/* Header (T16: الگوی تک‌رنگ با لهجهٔ برند) */}
      <div className="flex items-center justify-between rounded-sm border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله پنجم: کارشناس تخصصی، پادکست صوتی و وضعیت انتشار</h3>
            <p className="text-xs text-muted-foreground">
              افزودن حس انسانی، کارت مشاور مستقیم مسیر با شماره داخلی، ویس راهنما و وضعیت نهایی تور
            </p>
          </div>
        </div>
      </div>

      {/* Consultant Card Details */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
            <Field label="شماره تلفن مستقیم یا شماره داخلی" hint="مثال: ۰۲۱-۹۱۰۰۰۰۰۰ داخلی ۲۰۴">
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
            {/* پولیش موج ۲: وقتی لینک هست، پخش‌کننده + «کپی لینک»؛ لینک خام فقط با «ویرایش لینک». */}
            <Field label="فایل صوتی یا پادکست معرفی تور (اختیاری)" hint="مسافر می‌تواند وویس مشاور را در صفحه تور بشنود">
              {(consultant.audioUrl || '').trim() ? (
                <div className="space-y-2">
                  <audio controls src={(consultant.audioUrl || '').trim()} className="h-9 w-full max-w-sm" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={copyAudioLink} className="gap-1.5 text-xs">
                      <Link2 className="size-4" />
                      کپی لینک
                    </Button>
                    {!showAudioUrl && (
                      <button type="button" onClick={() => setShowAudioUrl(true)} className="text-[11px] font-bold text-brand hover:underline">
                        ویرایش لینک
                      </button>
                    )}
                  </div>
                  {showAudioUrl && (
                    <Input
                      dir="ltr"
                      value={consultant.audioUrl || ''}
                      onChange={(e) => updateConsultant({ audioUrl: e.target.value })}
                      placeholder="https://rivansafar.com/audio/..."
                      aria-label="لینک فایل صوتی"
                    />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Input
                    dir="ltr"
                    value={consultant.audioUrl || ''}
                    onChange={(e) => updateConsultant({ audioUrl: e.target.value })}
                    placeholder="https://rivansafar.com/audio/..."
                    className="ps-9"
                  />
                  <Mic className="size-4 text-purple-500 absolute left-3 top-2.5" />
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* توضیحات کلی تور به مرحلهٔ ۱ منتقل شد (T17) */}

      {/* Publishing Status: وضعیت ظرفیت هم در مرحلهٔ ۱ است (T4)؛ اینجا فقط راهنما می‌ماند */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <span>وضعیت ظرفیت و انتشار تور</span>
        </h4>

        <div className="flex flex-col justify-center rounded-sm bg-secondary/30 p-4 border border-border/60">
          <span className="text-xs font-bold text-foreground">راهنمای وضعیت</span>
          <p className="text-[11px] text-muted-foreground mt-1">
            «ظرفیت» فقط وضعیت ظرفیت است (روی سایت به‌صورت برچسب دیده می‌شود؛ انتخابش در مرحلهٔ ۱ است). این‌که تور روی سایت دیده شود یا نه با «انتشار» است. تور «پیش‌نویس» روی سایت نیست و با دکمهٔ «انتشار» پایین همین فرم منتشر می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
