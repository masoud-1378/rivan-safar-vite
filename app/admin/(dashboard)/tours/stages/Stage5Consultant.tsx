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
  Link2,
  Loader2,
  Upload,
  Check,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { uploadConsultantAudio } from '../audio-upload';
import { cn, fa } from '@/lib/utils';
import type { TourConsultantSpecItem, TourInput, TourConsultantSuggestion } from '../actions';
import { getTourConsultantSuggestion } from '../actions';
import { listTourConsultants, type TourConsultantOption } from '../consultants';
import { SmartSuggestion } from '../SmartSuggestion';

interface Stage5ConsultantProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  /** شناسهٔ تور در حال ویرایش؛ پیشنهادها خودش را منبع حساب نمی‌کنند. */
  excludeTourId?: string | null;
}

/**
 * ایراد ۹ مسعود (موج ۶): انتخابگر کارشناس‌های قبلی، بالای فرم.
 *
 * کمبوباکس جست‌وجوپذیر روی نام/عنوان/تلفن. با انتخاب، نام، عنوان، تلفن و
 * تلفن اضطراری در همان رکوردِ فرم می‌نشیند — رکورد تازهٔ پنهانی ساخته
 * نمی‌شود و ویرایش دستیِ بعدی همان فیلدهای فرم را عوض می‌کند.
 * «کارشناس تازه» فیلدهای هویتی را خالی می‌کند (رفتار دستیِ فعلی).
 * لینک صوتی مال تور است نه مال کارشناس؛ دست نخورده می‌ماند.
 */
function ConsultantPicker({
  options,
  loading,
  currentName,
  onPick,
  onFresh,
}: {
  options: TourConsultantOption[];
  loading: boolean;
  currentName: string;
  onPick: (opt: TourConsultantOption) => void;
  onFresh: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [highlight, setHighlight] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const q = (typing ? query : '').trim();
  const matched = options.find((o) => o.name === currentName.trim());

  const filtered = React.useMemo(() => {
    if (!q) return options;
    return options.filter(
      (o) => o.name.includes(q) || o.title.includes(q) || o.phone.includes(q),
    );
  }, [options, q]);

  // «کارشناس تازه» همیشه ردیف اول فهرست است.
  const total = 1 + filtered.length;

  React.useEffect(() => {
    setHighlight(0);
  }, [q, open]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setTyping(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pickFresh = () => {
    onFresh();
    setQuery('');
    setTyping(false);
    setOpen(false);
  };
  const pick = (o: TourConsultantOption) => {
    onPick(o);
    setTyping(false);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setTyping(false);
      return;
    }
    if (!open) {
      if (e.key === 'ArrowDown' && !loading) setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight === 0) pickFresh();
      else {
        const o = filtered[highlight - 1];
        if (o) pick(o);
      }
    }
  };

  const inputValue = typing ? query : (matched?.name ?? '');

  return (
    <Field
      label="کارشناس‌های قبلی"
      hint={
        loading
          ? 'در حال بارگذاری فهرست…'
          : 'کارشناسِ قبلاً واردشده را از فهرست انتخاب کنید تا مشخصاتش در فرم بیاید.'
      }
    >
      <div ref={wrapRef} className="relative">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => {
              setQuery(e.target.value);
              setTyping(true);
              setOpen(true);
            }}
            onFocus={() => {
              if (!loading) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder="جست‌وجوی نام، عنوان یا تلفن…"
            disabled={loading}
            className="pe-10 max-md:text-base"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
          />
          <div className="absolute end-1 top-1/2 flex -translate-y-1/2 items-center">
            {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            <button
              type="button"
              onClick={() => {
                if (!loading) setOpen((o) => !o);
              }}
              aria-label={open ? 'بستن فهرست' : 'باز کردن فهرست'}
              className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
            </button>
          </div>
        </div>

        {open && (
          <div
            role="listbox"
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-sm border border-border bg-popover shadow-lg"
          >
            <button
              type="button"
              role="option"
              aria-selected={highlight === 0}
              onMouseEnter={() => setHighlight(0)}
              onClick={pickFresh}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2.5 text-start',
                highlight === 0 ? 'bg-muted' : 'bg-transparent',
              )}
            >
              <UserPlus className="size-4 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-panel-label text-foreground">کارشناس تازه</span>
                <span className="block text-panel-caption text-muted-foreground">ورود دستی مشخصات</span>
              </span>
            </button>
            {filtered.length > 0 && <div className="mx-3 border-t border-border" aria-hidden />}
            {filtered.map((o, i) => {
              const idx = i + 1;
              const selected = matched?.name === o.name;
              return (
                <button
                  key={o.name}
                  type="button"
                  role="option"
                  aria-selected={idx === highlight}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => pick(o)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start',
                    idx === highlight ? 'bg-muted' : 'bg-transparent',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-panel-label text-foreground">{o.name}</span>
                    {o.title ? (
                      <span className="block truncate text-panel-caption text-muted-foreground">{o.title}</span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {o.phone ? (
                      <span dir="ltr" className="text-panel-caption text-muted-foreground">
                        {o.phone}
                      </span>
                    ) : null}
                    {selected && <Check className="size-3.5 text-brand" />}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && q !== '' && (
              <p className="px-3 py-2.5 text-panel-caption text-muted-foreground">
                کارشناسی با این مشخصات در فهرست نیست.
              </p>
            )}
          </div>
        )}
      </div>
    </Field>
  );
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

  /**
   * ایراد ۹ مسعود (موج ۶): فهرست کارشناس‌های قبلی از روی تورهای موجود.
   * null یعنی هنوز بارگذاری نشده؛ [] یعنی فهرستی نیست و انتخابگر نشان داده نمی‌شود.
   */
  const [prevConsultants, setPrevConsultants] = React.useState<TourConsultantOption[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    listTourConsultants(excludeTourId ?? null)
      .then((rows) => {
        if (alive) setPrevConsultants(rows);
      })
      .catch(() => {
        if (alive) setPrevConsultants([]);
      });
    return () => {
      alive = false;
    };
  }, [excludeTourId]);

  const pickPrevConsultant = (opt: TourConsultantOption) => {
    updateConsultant({
      name: opt.name,
      title: opt.title || '',
      phone: opt.phone || '',
      emergencyPhone: opt.emergencyPhone || '',
    });
    toast({ title: `مشخصات «${opt.name}» در فرم نشست` });
  };

  const freshConsultant = () => {
    onChange({
      consultantSpec: { ...consultant, name: '', title: '', phone: '', emergencyPhone: '' },
    });
    toast({ title: 'فیلدها برای کارشناس تازه خالی شد' });
  };

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

  const audioFileRef = React.useRef<HTMLInputElement>(null);
  const [audioUploading, setAudioUploading] = React.useState(false);

  async function uploadAudioFile(file: File | undefined) {
    if (!file || audioUploading) return;
    setAudioUploading(true);
    try {
      const fd = new FormData();
      fd.set('audio', file);
      const res = await uploadConsultantAudio(data.slug || 'tour', fd);
      if (res.ok === false) {
        toast({ variant: 'error', title: res.error });
        return;
      }
      updateConsultant({ audioUrl: res.url });
      toast({ title: 'فایل صوتی آپلود شد' });
    } finally {
      setAudioUploading(false);
    }
  }

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
          <span className="text-caption text-muted-foreground">پایین صفحهٔ تور می‌آید تا مسافر مستقیم با او تماس بگیرد</span>
        </div>

        {/* ایراد ۹ مسعود (موج ۶): انتخاب از کارشناس‌های قبلی — فقط وقتی فهرستی هست یا در حال بارگذاری است. */}
        {(prevConsultants === null || prevConsultants.length > 0) && (
          <ConsultantPicker
            options={prevConsultants ?? []}
            loading={prevConsultants === null}
            currentName={consultant.name || ''}
            onPick={pickPrevConsultant}
            onFresh={freshConsultant}
          />
        )}

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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={audioUploading}
                      onClick={() => audioFileRef.current?.click()}
                      className="gap-1.5 text-xs"
                    >
                      {audioUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      {audioUploading ? 'در حال آپلود…' : 'تغییر فایل صوتی'}
                    </Button>
                    {!showAudioUrl && (
                      <button type="button" onClick={() => setShowAudioUrl(true)} className="text-caption font-bold text-brand hover:underline">
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
                <div className="space-y-2">
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={audioUploading}
                      onClick={() => audioFileRef.current?.click()}
                      className="gap-1.5 text-xs"
                    >
                      {audioUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      {audioUploading ? 'در حال آپلود…' : 'آپلود فایل صوتی'}
                    </Button>
                    <span className="text-caption text-muted-foreground">یا لینک را بالا بچسبانید</span>
                  </div>
                </div>
              )}
              <input
                ref={audioFileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                aria-label="انتخاب فایل صوتی"
                onChange={(e) => {
                  void uploadAudioFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
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
          <p className="text-caption text-muted-foreground mt-1">
            «وضعیت فروش» یعنی ثبت‌نام باز است یا بسته؛ به‌صورت برچسب روی سایت دیده می‌شود و انتخابش در مرحلهٔ ۱ است. این‌که تور روی سایت دیده شود یا نه با «انتشار» است. تور «پیش‌نویس» روی سایت نیست و با دکمهٔ «انتشار» پایین همین فرم منتشر می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
