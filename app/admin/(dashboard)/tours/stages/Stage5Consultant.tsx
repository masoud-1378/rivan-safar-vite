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
import { fa } from '@/lib/utils';
import type { TourConsultantSpecItem, TourInput, TourConsultantSuggestion } from '../actions';
import { getTourConsultantSuggestion } from '../actions';
import { SmartSuggestion } from '../SmartSuggestion';

interface Stage5ConsultantProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  /** شناسهٔ تور در حال ویرایش؛ پیشنهادها خودش را منبع حساب نمی‌کنند. */
  excludeTourId?: string | null;
}

export default function Stage5Consultant({ data, onChange, excludeTourId }: Stage5ConsultantProps) {
  const consultant = data.consultantSpec || {};
  const { toast } = useToast();
  // پولیش موج ۲: لینک صوتی خام پشت «ویرایش لینک»/«کپی لینک» است؛ پیش‌نمایش پخش‌کننده.
  const [showAudioUrl, setShowAudioUrl] = useState(false);

  /**
   * قلم ۴ موج ۲: کارشناس پیشنهادی از تورهای قبلی همین مقصد — قانون طلایی:
   * فقط پیشنهاد با «پذیرفتن»/«رد». اگر هیچ تور قبلی‌ای کارشناس ثبت‌شده
   * نداشته باشد، چیزی پیشنهاد نمی‌شود (دادهٔ فعلی: هیچ توری کارشناس ندارد،
   * پس این قلم فعلاً خفته است).
   */
  const singleDestSlug = Array.isArray(data.destinationSlugs) && data.destinationSlugs.length === 1
    ? data.destinationSlugs[0]
    : null;
  const [consultantSuggestion, setConsultantSuggestion] = useState<TourConsultantSuggestion | null>(null);
  const [dismissedConsultantKey, setDismissedConsultantKey] = useState<string | null>(null);
  React.useEffect(() => {
    if (!singleDestSlug) {
      setConsultantSuggestion(null);
      return;
    }
    let alive = true;
    getTourConsultantSuggestion(singleDestSlug, excludeTourId ?? null)
      .then((s) => {
        if (alive) setConsultantSuggestion(s);
      })
      .catch(() => {
        if (alive) setConsultantSuggestion(null);
      });
    return () => {
      alive = false;
    };
  }, [singleDestSlug, excludeTourId]);
  const consultantKey = consultantSuggestion ? `${singleDestSlug}:${consultantSuggestion.name}` : null;
  const consultantNameEmpty = !(consultant.name || '').trim();

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
            <h3 className="text-sm font-bold text-foreground">مرحله پنجم: کارشناس مسیر و راهنمای انتشار</h3>
            <p className="text-xs text-muted-foreground">
              کارشناسی که مسافر مستقیم با او تماس می‌گیرد؛ نام و شماره‌اش در صفحهٔ تور نشان داده می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* Consultant Card Details */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <UserCheck className="size-4 text-purple-600" />
            <span>مشخصات کارشناس این تور</span>
          </h4>
          <span className="text-[11px] text-muted-foreground">در پایین صفحهٔ تور نمایش داده می‌شود تا مسافر مستقیم با او تماس بگیرد</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Field label="نام و نام خانوادگی کارشناس" hint="مثال: سحر راد، میلاد محمدی">
              <Input className="max-md:text-base"
                value={consultant.name || ''}
                onChange={(e) => updateConsultant({ name: e.target.value })}
                placeholder="نام کارشناس…"
              />
            </Field>
          </div>
          <div>
            <Field label="عنوان شغلی یا سمت" hint="مثال: سرپرست تورهای اروپا">
              <Input className="max-md:text-base"
                value={consultant.title || ''}
                onChange={(e) => updateConsultant({ title: e.target.value })}
                placeholder="عنوان کارشناس…"
              />
            </Field>
          </div>

          <div>
            <Field label="شماره تلفن مستقیم یا شماره داخلی" hint="مثال: ۰۲۱-۹۱۰۰۰۰۰۰ داخلی ۲۰۴">
              <Input className="max-md:text-base"
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
            <Field label="شماره تماس اضطراری در سفر" hint="شماره همراه پشتیبان در کشور مقصد">
              <Input className="max-md:text-base"
                dir="ltr"
                value={consultant.emergencyPhone || ''}
                onChange={(e) => updateConsultant({ emergencyPhone: e.target.value })}
                placeholder="+98912xxxxxxx"
              />
            </Field>
          </div>

          <div>
            {/* پولیش موج ۲: وقتی لینک هست، پخش‌کننده + «کپی لینک»؛ لینک خام فقط با «ویرایش لینک». */}
            <Field label="فایل صوتی یا پادکست معرفی تور (اختیاری)" hint="مسافر می‌تواند صدای مشاور را در صفحهٔ تور بشنود">
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
                    <Input className="max-md:text-base"
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
                    className="ps-9 max-md:text-base"
                  />
                  <Mic className="size-4 text-purple-500 absolute left-3 top-2.5" />
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* قلم ۴ موج ۲: کارشناس پیشنهادی — فقط وقتی نام کارشناس هنوز خالی است. */}
      {consultantSuggestion && consultantNameEmpty && consultantKey !== dismissedConsultantKey && (
        <SmartSuggestion
          title={`کارشناس پیشنهادی: ${consultantSuggestion.name}`}
          description={
            `در ${consultantSuggestion.tourCount > 1 ? `${fa(consultantSuggestion.tourCount)} تور قبلی همین مقصد` : 'تور قبلی همین مقصد'}، «${consultantSuggestion.name}» کارشناس بوده است.` +
            ' اگر درست است، با پذیرفتن نام و شماره‌اش در فرم می‌آید.'
          }
          onAccept={() => {
            updateConsultant({
              name: consultantSuggestion.name,
              title: consultantSuggestion.title || consultant.title,
              phone: consultantSuggestion.phone || consultant.phone,
            });
            toast({ title: 'کارشناس پیشنهادی گذاشته شد' });
          }}
          onReject={() => setDismissedConsultantKey(consultantKey)}
        />
      )}

      {/* توضیحات کلی تور به مرحلهٔ ۱ منتقل شد (T17) */}

      {/* Publishing Status: وضعیت فروش هم در مرحلهٔ ۱ است (T4)؛ اینجا فقط راهنما می‌ماند */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <span>وضعیت فروش و انتشار تور</span>
        </h4>

        <div className="flex flex-col justify-center rounded-sm bg-secondary/30 p-4 border border-border/60">
          <span className="text-xs font-bold text-foreground">راهنما</span>
          <p className="text-[11px] text-muted-foreground mt-1">
            «وضعیت فروش» یعنی ثبت‌نام باز است یا بسته؛ به‌صورت برچسب روی سایت دیده می‌شود و انتخابش در مرحلهٔ ۱ است. این‌که تور روی سایت دیده شود یا نه با «انتشار» است. تور «پیش‌نویس» روی سایت نیست و با دکمهٔ «انتشار» پایین همین فرم منتشر می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
