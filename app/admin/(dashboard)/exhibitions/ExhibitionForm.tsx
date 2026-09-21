'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveExhibition, type ExhibitionInput, type ExhibitionRow, type ExhibitionStatus } from './actions';

const STATUSES: Array<{ value: ExhibitionStatus; label: string }> = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'در حال بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

function parseJsonArray(raw: string): { ok: boolean; value: unknown[]; error?: string } {
  try {
    const parsed = JSON.parse((raw || '').trim() || '[]');
    if (!Array.isArray(parsed)) return { ok: false, value: [], error: 'ساختار باید آرایه JSON باشد.' };
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, value: [], error: 'فرمت JSON نامعتبر است.' };
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
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  const [countrySlug, setCountrySlug] = useState(initial?.countrySlug ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? '');
  const [venue, setVenue] = useState(initial?.venue ?? '');
  const [officialWebsite, setOfficialWebsite] = useState(initial?.officialWebsite ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [industrySlug, setIndustrySlug] = useState(initial?.industrySlug ?? '');
  const [heroTagline, setHeroTagline] = useState(initial?.heroTagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [editionSlug, setEditionSlug] = useState(initial?.editionSlug ?? '');
  const [solarDate, setSolarDate] = useState(initial?.solarDate ?? '');
  const [gregorianDate, setGregorianDate] = useState(initial?.gregorianDate ?? '');
  const [visaDeadline, setVisaDeadline] = useState(initial?.visaDeadline ?? '');
  const [hotelArea, setHotelArea] = useState(initial?.hotelArea ?? '');
  const [startingPrice, setStartingPrice] = useState(initial?.startingPrice ?? '');
  const [startingPriceNote, setStartingPriceNote] = useState(initial?.startingPriceNote ?? '');
  const [phasesJson, setPhasesJson] = useState(
    initial?.phases ? JSON.stringify(initial.phases, null, 2) : '[]',
  );
  const [servicesJson, setServicesJson] = useState(
    initial?.servicesIncluded ? JSON.stringify(initial.servicesIncluded, null, 2) : '[]',
  );
  const [tipsJson, setTipsJson] = useState(
    initial?.businessTips ? JSON.stringify(initial.businessTips, null, 2) : '[]',
  );
  const [faqsJson, setFaqsJson] = useState(
    initial?.faqs ? JSON.stringify(initial.faqs, null, 2) : '[]',
  );
  const [status, setStatus] = useState<ExhibitionStatus>(initial?.status ?? 'draft');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phases = parseJsonArray(phasesJson);
    if (!phases.ok) { setError(`خطا در فازهای نمایشگاه: ${phases.error}`); return; }
    const services = parseJsonArray(servicesJson);
    if (!services.ok) { setError(`خطا در خدمات شامل: ${services.error}`); return; }
    const tips = parseJsonArray(tipsJson);
    if (!tips.ok) { setError(`خطا در نکات تجاری: ${tips.error}`); return; }
    const faqs = parseJsonArray(faqsJson);
    if (!faqs.ok) { setError(`خطا در پرسش‌ها: ${faqs.error}`); return; }

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
      solarDate: solarDate.trim(),
      gregorianDate: gregorianDate.trim(),
      phases: phases.value,
      visaDeadline: visaDeadline.trim(),
      hotelArea: hotelArea.trim(),
      startingPrice: startingPrice.trim(),
      startingPriceNote: startingPriceNote.trim(),
      servicesIncluded: services.value,
      businessTips: tips.value,
      faqs: faqs.value,
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
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-control text-body-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک انگلیسی (Slug)" htmlFor="ex-slug">
          <Input id="ex-slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="text-left" dir="ltr" placeholder="e.g. gitex-2025" required />
        </Field>
        <Field label="عنوان فارسی" htmlFor="ex-title-fa">
          <Input id="ex-title-fa" value={titleFa} onChange={(e) => setTitleFa(e.target.value)} placeholder="مثال: نمایشگاه جیتکس دبی" required />
        </Field>
        <Field label="عنوان انگلیسی (titleEn)" htmlFor="ex-title-en">
          <Input id="ex-title-en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="text-left" dir="ltr" placeholder="e.g. GITEX Global 2025" />
        </Field>
        <Field label="کشور (country)" htmlFor="ex-country">
          <Input id="ex-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="مثال: امارات" />
        </Field>
        <Field label="نامک کشور (countrySlug)" htmlFor="ex-country-slug">
          <Input id="ex-country-slug" value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className="text-left" dir="ltr" placeholder="uae" />
        </Field>
        <Field label="شهر (city)" htmlFor="ex-city">
          <Input id="ex-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: دبی" />
        </Field>
        <Field label="نامک شهر (citySlug)" htmlFor="ex-city-slug">
          <Input id="ex-city-slug" value={citySlug} onChange={(e) => setCitySlug(e.target.value)} className="text-left" dir="ltr" placeholder="dubai" />
        </Field>
        <Field label="محل برگزاری (venue)" htmlFor="ex-venue">
          <Input id="ex-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="مثال: مرکز تجارت جهانی دبی" />
        </Field>
        <Field label="وب‌سایت رسمی (officialWebsite)" htmlFor="ex-web">
          <Input id="ex-web" value={officialWebsite} onChange={(e) => setOfficialWebsite(e.target.value)} className="text-left" dir="ltr" placeholder="https://..." />
        </Field>
        <Field label="صنعت (industry)" htmlFor="ex-industry">
          <Input id="ex-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="مثال: فناوری اطلاعات" />
        </Field>
        <Field label="نامک صنعت (industrySlug)" htmlFor="ex-industry-slug">
          <Input id="ex-industry-slug" value={industrySlug} onChange={(e) => setIndustrySlug(e.target.value)} className="text-left" dir="ltr" placeholder="technology" />
        </Field>
        <Field label="تصویر (image)" htmlFor="ex-image">
          <Input id="ex-image" value={image} onChange={(e) => setImage(e.target.value)} className="text-left" dir="ltr" placeholder="https://..." />
        </Field>
        <Field label="نامک دوره (editionSlug)" htmlFor="ex-edition">
          <Input id="ex-edition" value={editionSlug} onChange={(e) => setEditionSlug(e.target.value)} className="text-left" dir="ltr" placeholder="2025" />
        </Field>
        <Field label="تاریخ شمسی (solarDate)" htmlFor="ex-solar">
          <Input id="ex-solar" value={solarDate} onChange={(e) => setSolarDate(e.target.value)} placeholder="مثال: ۲۲ تا ۲۶ مهر ۱۴۰۴" />
        </Field>
        <Field label="تاریخ میلادی (gregorianDate)" htmlFor="ex-greg">
          <Input id="ex-greg" value={gregorianDate} onChange={(e) => setGregorianDate(e.target.value)} className="text-left" dir="ltr" placeholder="e.g. Oct 13-17, 2025" />
        </Field>
        <Field label="قیمت پایه (startingPrice)" htmlFor="ex-price">
          <Input id="ex-price" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="مثال: از ۴۵ میلیون تومان" />
        </Field>
        <Field label="وضعیت انتشار" htmlFor="ex-status">
          <Select id="ex-status" value={status} onChange={(e) => setStatus(e.target.value as ExhibitionStatus)} options={STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        </Field>
      </div>

      <Field label="شعار اصلی (heroTagline)" htmlFor="ex-tagline">
        <Input id="ex-tagline" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} placeholder="جمله کوتاه معرفی نمایشگاه..." />
      </Field>

      <Field label="توضیحات کامل (description)" htmlFor="ex-desc">
        <Textarea id="ex-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" placeholder="معرفی کامل نمایشگاه..." />
      </Field>

      <Field label="مهلت ویزا (visaDeadline)" htmlFor="ex-visa">
        <Textarea id="ex-visa" value={visaDeadline} onChange={(e) => setVisaDeadline(e.target.value)} className="min-h-20" placeholder="توضیحات مربوط به مهلت و مدارک ویزا..." />
      </Field>

      <Field label="منطقه هتل (hotelArea)" htmlFor="ex-hotel">
        <Textarea id="ex-hotel" value={hotelArea} onChange={(e) => setHotelArea(e.target.value)} className="min-h-20" placeholder="توضیحات محل اقامت و منطقه هتل..." />
      </Field>

      <Field label="توضیح قیمت پایه (startingPriceNote)" htmlFor="ex-price-note">
        <Textarea id="ex-price-note" value={startingPriceNote} onChange={(e) => setStartingPriceNote(e.target.value)} className="min-h-20" placeholder="جزئیات قیمت و خدمات مشمول..." />
      </Field>

      <Field label="فازهای نمایشگاه (phases)" htmlFor="ex-phases" hint="آرایه JSON فازها - هر فاز شامل عنوان، تاریخ و توضیح">
        <Textarea id="ex-phases" value={phasesJson} onChange={(e) => setPhasesJson(e.target.value)} className="min-h-36 font-mono text-left" dir="ltr" placeholder="[]" />
      </Field>

      <Field label="خدمات شامل تور (servicesIncluded)" htmlFor="ex-services" hint="آرایه JSON خدمات - لیست رشته‌ها یا آبجکت‌ها">
        <Textarea id="ex-services" value={servicesJson} onChange={(e) => setServicesJson(e.target.value)} className="min-h-32 font-mono text-left" dir="ltr" placeholder="[]" />
      </Field>

      <Field label="نکات تجاری (businessTips)" htmlFor="ex-tips" hint="آرایه JSON نکات تجاری برای مسافران کاری">
        <Textarea id="ex-tips" value={tipsJson} onChange={(e) => setTipsJson(e.target.value)} className="min-h-32 font-mono text-left" dir="ltr" placeholder="[]" />
      </Field>

      <Field label="پرسش‌های متداول (faqs)" htmlFor="ex-faqs" hint="آرایه JSON پرسش‌ها - هر آیتم شامل question, answer">
        <Textarea id="ex-faqs" value={faqsJson} onChange={(e) => setFaqsJson(e.target.value)} className="min-h-32 font-mono text-left" dir="ltr" placeholder="[]" />
      </Field>

      <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>{pending ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">انصراف</Button>
        )}
      </div>
      </form>
    </Card>
  );
}
