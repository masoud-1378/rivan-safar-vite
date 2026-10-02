'use client';

import React, { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatJalali } from '@/lib/jalali';
import { faSlug } from '@/lib/utils';
import { saveExhibition, type ExhibitionInput, type ExhibitionRow, type ExhibitionStatus } from './actions';
import BlockEditor, { cleanBlocks, validateBlocks } from '@/components/ui/block-editor';

const STATUSES: Array<{ value: ExhibitionStatus; label: string }> = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'در حال بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

function gregorianLabel(date: Date) {
  try {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  } catch {
    return '';
  }
}

export default function ExhibitionForm({
  initial,
  editingId,
  onSaved,
  onCancel,
}: {
  initial?: ExhibitionRow | null;
  editingId?: string | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  const [countrySlug, setCountrySlug] = useState(initial?.countrySlug ?? '');
  const [countrySlugTouched, setCountrySlugTouched] = useState(Boolean(initial?.countrySlug));
  const [city, setCity] = useState(initial?.city ?? '');
  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? '');
  const [citySlugTouched, setCitySlugTouched] = useState(Boolean(initial?.citySlug));
  const [venue, setVenue] = useState(initial?.venue ?? '');
  const [officialWebsite, setOfficialWebsite] = useState(initial?.officialWebsite ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [industrySlug, setIndustrySlug] = useState(initial?.industrySlug ?? '');
  const [industrySlugTouched, setIndustrySlugTouched] = useState(Boolean(initial?.industrySlug));
  const [heroTagline, setHeroTagline] = useState(initial?.heroTagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [editionSlug, setEditionSlug] = useState(initial?.editionSlug ?? '');
  const [editionSlugTouched, setEditionSlugTouched] = useState(Boolean(initial?.editionSlug));
  // F1: «تاریخ شروع» و «تاریخ پایان (اختیاری)» هر دو DatePicker شمسی‌اند؛
  // «متن نمایشی تاریخ» اگر پر باشد همان روی سایت می‌آید و رکوردهای قدیمیِ
  // بازه‌دار (مثل «۲۴ مهر تا ۱۴ آبان ۱۴۰۵») را دست‌نخورده نگه می‌دارد.
  const [startPicked, setStartPicked] = useState<Date | null>(null);
  const [endPicked, setEndPicked] = useState<Date | null>(null);
  const [displayText, setDisplayText] = useState(initial?.solarDate ?? '');
  const [slugError, setSlugError] = useState<string | undefined>();
  const [gregorianDate, setGregorianDate] = useState(initial?.gregorianDate ?? '');
  const [visaDeadline, setVisaDeadline] = useState(initial?.visaDeadline ?? '');
  const [hotelArea, setHotelArea] = useState(initial?.hotelArea ?? '');
  const [startingPrice, setStartingPrice] = useState(initial?.startingPrice ?? '');
  const [startingPriceNote, setStartingPriceNote] = useState(initial?.startingPriceNote ?? '');
  const [phases, setPhases] = useState<unknown[]>(
    Array.isArray(initial?.phases) ? initial.phases : [],
  );
  const [services, setServices] = useState<unknown[]>(
    Array.isArray(initial?.servicesIncluded) ? initial.servicesIncluded : [],
  );
  const [tips, setTips] = useState<unknown[]>(
    Array.isArray(initial?.businessTips) ? initial.businessTips : [],
  );
  const [faqs, setFaqs] = useState<unknown[]>(
    Array.isArray(initial?.faqs) ? initial.faqs : [],
  );
  const [phasesError, setPhasesError] = useState<string | undefined>();
  const [faqsError, setFaqsError] = useState<string | undefined>();
  const [status, setStatus] = useState<ExhibitionStatus>(initial?.status ?? 'draft');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // E2: نامک خودکار از نام فارسی — تا وقتی کاربر دستی دست نزده باشد.
  const onTitleFa = (v: string) => {
    setTitleFa(v);
    if (!slugTouched) setSlug(faSlug(v));
  };
  const onCountry = (v: string) => {
    setCountry(v);
    if (!countrySlugTouched) setCountrySlug(faSlug(v));
  };
  const onCity = (v: string) => {
    setCity(v);
    if (!citySlugTouched) setCitySlug(faSlug(v));
  };
  const onIndustry = (v: string) => {
    setIndustry(v);
    if (!industrySlugTouched) setIndustrySlug(faSlug(v));
  };

  // F1: انتخاب شروع/پایان، «متن نمایشی» را می‌سازد؛ تاریخ میلادی خودکار از شروع.
  const buildDisplay = (start: Date | null, end: Date | null) => {
    if (!start) return '';
    const s = formatJalali(start);
    return end ? `${s} تا ${formatJalali(end)}` : s;
  };
  const onStartPick = (d: Date | null) => {
    setStartPicked(d);
    setGregorianDate(d ? gregorianLabel(d) : '');
    if (d && !editionSlugTouched) setEditionSlug(String(d.getFullYear()));
    setDisplayText(buildDisplay(d, endPicked));
  };
  const onEndPick = (d: Date | null) => {
    setEndPicked(d);
    if (d || startPicked) setDisplayText(buildDisplay(startPicked, d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // F14: به‌جای required بومی، اعتبارسنجی با پیام فارسی زیر فیلد.
    if (!slug.trim()) {
      setSlugError('نامک را وارد کنید.');
      return;
    }
    setSlugError(undefined);

    const phasesProblem = validateBlocks('phase', phases);
    setPhasesError(phasesProblem ?? undefined);
    const faqsProblem = validateBlocks('faq', faqs);
    setFaqsError(faqsProblem ?? undefined);
    if (phasesProblem || faqsProblem) return;

    const payload: ExhibitionInput = {
      slug: slug.trim(),
      titleFa: titleFa.trim(),
      titleEn: titleEn.trim(),
      country: country.trim(),
      countrySlug: countrySlug.trim(),
      city: city.trim(),
      citySlug: citySlug.trim(),
      venue: venue.trim(),
      officialWebsite: officialWebsite.trim(),
      industry: industry.trim(),
      industrySlug: industrySlug.trim(),
      heroTagline: heroTagline.trim(),
      description: description.trim(),
      image: image.trim(),
      editionSlug: editionSlug.trim(),
      solarDate: displayText.trim(),
      gregorianDate: gregorianDate.trim(),
      phases: cleanBlocks('phase', phases),
      visaDeadline: visaDeadline.trim(),
      hotelArea: hotelArea.trim(),
      startingPrice: startingPrice.trim(),
      startingPriceNote: startingPriceNote.trim(),
      servicesIncluded: cleanBlocks('lines', services),
      businessTips: cleanBlocks('lines', tips),
      faqs: cleanBlocks('faq', faqs),
      status,
    };

    startTransition(async () => {
      try {
        await saveExhibition(editingId ?? null, payload);
        if (onSaved) onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطای نامشخص در ذخیره‌سازی.');
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div><h2 className="text-lg font-semibold">{editingId ? 'ویرایش نمایشگاه' : 'نمایشگاه جدید'}</h2><p className="mt-1 text-sm text-muted-foreground">اطلاعات نمایشگاه و خدمات سفر کاری را وارد کنید.</p></div>
          {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>انصراف</Button>}
        </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="عنوان فارسی" htmlFor="ex-title-fa">
          <Input id="ex-title-fa" value={titleFa} onChange={(e) => onTitleFa(e.target.value)} placeholder="مثال: نمایشگاه جیتکس دبی" required />
        </Field>
        <Field label="کشور" htmlFor="ex-country">
          <Input id="ex-country" value={country} onChange={(e) => onCountry(e.target.value)} placeholder="مثال: امارات" />
        </Field>
        <Field label="شهر" htmlFor="ex-city">
          <Input id="ex-city" value={city} onChange={(e) => onCity(e.target.value)} placeholder="مثال: دبی" />
        </Field>
        <Field label="محل برگزاری" htmlFor="ex-venue">
          <Input id="ex-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="مثال: مرکز تجارت جهانی دبی" />
        </Field>
        <Field label="صنعت" htmlFor="ex-industry">
          <Input id="ex-industry" value={industry} onChange={(e) => onIndustry(e.target.value)} placeholder="مثال: فناوری اطلاعات" />
        </Field>
        <Field label="تصویر" htmlFor="ex-image" hint="فقط لینک Unsplash">
          <Input id="ex-image" value={image} onChange={(e) => setImage(e.target.value)} className="text-start" dir="ltr" placeholder="https://..." />
        </Field>
        <Field label="تاریخ شروع" htmlFor="ex-start">
          <DatePicker value={startPicked} onChange={onStartPick} placeholder="انتخاب تاریخ شروع" />
        </Field>
        <Field label="تاریخ پایان (اختیاری)" htmlFor="ex-end">
          <DatePicker value={endPicked} onChange={onEndPick} placeholder="انتخاب تاریخ پایان" />
        </Field>
        <Field label="متن نمایشی تاریخ (اختیاری)" htmlFor="ex-display" hint="اگر پر باشد، همین متن روی سایت نمایش داده می‌شود؛ برای حفظ تاریخ‌های بازه‌ای قدیمی." className="sm:col-span-2">
          <Input id="ex-display" value={displayText} onChange={(e) => setDisplayText(e.target.value)} placeholder="مثال: ۲۴ مهر تا ۱۴ آبان ۱۴۰۵" />
        </Field>
        <Field label="قیمت پایه" htmlFor="ex-price">
          <Input id="ex-price" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="مثال: از ۴۵ میلیون تومان" />
        </Field>
        <Field label="وضعیت انتشار" htmlFor="ex-status">
          <Select id="ex-status" value={status} onChange={(e) => setStatus(e.target.value as ExhibitionStatus)} options={STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </Field>
      </div>

      <Field label="مهلت ویزا" htmlFor="ex-visa">
        <Textarea id="ex-visa" value={visaDeadline} onChange={(e) => setVisaDeadline(e.target.value)} className="min-h-20" placeholder="توضیحات مربوط به مهلت و مدارک ویزا..." />
      </Field>

      {/* E4: فیلدهای کم‌کاربرد در بخش تاشوی «تکمیلی» */}
      <Collapsible trigger="تکمیلی" openLabel="بستن بخش تکمیلی" className="rounded-sm border border-border bg-muted/20 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نامک انگلیسی" htmlFor="ex-slug" hint="خودکار از عنوان فارسی ساخته می‌شود؛ فقط اگر لازم بود تغییرش دهید." error={slugError}>
            <Input id="ex-slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); setSlugError(undefined); }} className="text-start" dir="ltr" placeholder="e.g. gitex-2025" />
          </Field>
          <Field label="عنوان انگلیسی" htmlFor="ex-title-en">
            <Input id="ex-title-en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="text-start" dir="ltr" placeholder="e.g. GITEX Global 2025" />
          </Field>
          <Field label="نامک کشور" htmlFor="ex-country-slug" hint="خودکار از نام کشور">
            <Input id="ex-country-slug" value={countrySlug} onChange={(e) => { setCountrySlug(e.target.value); setCountrySlugTouched(true); }} className="text-start" dir="ltr" placeholder="uae" />
          </Field>
          <Field label="نامک شهر" htmlFor="ex-city-slug" hint="خودکار از نام شهر">
            <Input id="ex-city-slug" value={citySlug} onChange={(e) => { setCitySlug(e.target.value); setCitySlugTouched(true); }} className="text-start" dir="ltr" placeholder="dubai" />
          </Field>
          <Field label="نامک صنعت" htmlFor="ex-industry-slug" hint="خودکار از نام صنعت">
            <Input id="ex-industry-slug" value={industrySlug} onChange={(e) => { setIndustrySlug(e.target.value); setIndustrySlugTouched(true); }} className="text-start" dir="ltr" placeholder="technology" />
          </Field>
          <Field label="نامک دوره" htmlFor="ex-edition" hint="خودکار از سال میلادی تاریخ برگزاری (مثلاً ۲۰۲۵)">
            <Input id="ex-edition" value={editionSlug} onChange={(e) => { setEditionSlug(e.target.value); setEditionSlugTouched(true); }} className="text-start" dir="ltr" placeholder="2025" />
          </Field>
          <Field label="تاریخ میلادی" htmlFor="ex-greg" hint="خودکار از تاریخ شمسی ساخته می‌شود.">
            <Input id="ex-greg" value={gregorianDate} readOnly className="text-start" dir="ltr" placeholder="—" />
          </Field>
          <Field label="وب‌سایت رسمی" htmlFor="ex-web">
            <Input id="ex-web" value={officialWebsite} onChange={(e) => setOfficialWebsite(e.target.value)} className="text-start" dir="ltr" placeholder="https://..." />
          </Field>
          <Field label="منطقه هتل" htmlFor="ex-hotel">
            <Textarea id="ex-hotel" value={hotelArea} onChange={(e) => setHotelArea(e.target.value)} className="min-h-20" placeholder="توضیحات محل اقامت و منطقه هتل..." />
          </Field>
          <Field label="توضیح قیمت پایه" htmlFor="ex-price-note">
            <Textarea id="ex-price-note" value={startingPriceNote} onChange={(e) => setStartingPriceNote(e.target.value)} className="min-h-20" placeholder="جزئیات قیمت و خدمات مشمول..." />
          </Field>
        </div>
      </Collapsible>

      <Field label="شعار اصلی" htmlFor="ex-tagline">
        <Input id="ex-tagline" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} placeholder="جمله کوتاه معرفی نمایشگاه..." />
      </Field>

      <Field label="توضیحات کامل" htmlFor="ex-desc">
        <Textarea id="ex-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" placeholder="معرفی کامل نمایشگاه..." />
      </Field>

      <BlockEditor
        kind="phase"
        title="فازهای نمایشگاه"
        value={phases}
        onChange={(next) => {
          setPhases(next);
          setPhasesError(undefined);
        }}
        error={phasesError}
      />

      <BlockEditor
        kind="lines"
        title="خدمات شامل تور"
        addLabel="افزودن خدمت"
        value={services}
        onChange={setServices}
      />

      <BlockEditor
        kind="lines"
        title="نکات تجاری"
        addLabel="افزودن نکته"
        value={tips}
        onChange={setTips}
      />

      <BlockEditor
        kind="faq"
        title="پرسش‌های متداول"
        value={faqs}
        onChange={(next) => {
          setFaqs(next);
          setFaqsError(undefined);
        }}
        error={faqsError}
      />

      <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>{pending ? 'در حال ذخیره…' : 'ذخیره'}</Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">انصراف</Button>
        )}
        </div>
      </form>
    </Card>
  );
}
