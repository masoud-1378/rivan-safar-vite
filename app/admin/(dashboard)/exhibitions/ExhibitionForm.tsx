'use client';

import React, { useState, useTransition } from 'react';
import { saveExhibition, type ExhibitionInput, type ExhibitionRow, type ExhibitionStatus } from './actions';

const STATUSES: Array<{ value: ExhibitionStatus; label: string }> = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'در حال بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

const inputCls =
  'w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm';

function Field({
  label,
  htmlFor,
  children,
  required,
  hint,
  ltr,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor || label} className="block text-caption font-bold text-text-heading mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-caption text-text-muted mt-1" dir={ltr ? 'ltr' : undefined}>{hint}</p>}
    </div>
  );
}

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
    <form
      onSubmit={handleSubmit}
      className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-h4 font-bold text-text-heading">
          {editingId ? 'ویرایش نمایشگاه' : 'نمایشگاه جدید'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-caption font-medium text-text-muted hover:text-text-primary"
          >
            انصراف
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-control text-body-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک انگلیسی (Slug)" htmlFor="ex-slug" required>
          <input id="ex-slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="e.g. gitex-2025" required />
        </Field>
        <Field label="عنوان فارسی" htmlFor="ex-title-fa" required>
          <input id="ex-title-fa" value={titleFa} onChange={(e) => setTitleFa(e.target.value)} className={inputCls} placeholder="مثال: نمایشگاه جیتکس دبی" required />
        </Field>
        <Field label="عنوان انگلیسی (titleEn)" htmlFor="ex-title-en">
          <input id="ex-title-en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="e.g. GITEX Global 2025" />
        </Field>
        <Field label="کشور (country)" htmlFor="ex-country">
          <input id="ex-country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} placeholder="مثال: امارات" />
        </Field>
        <Field label="نامک کشور (countrySlug)" htmlFor="ex-country-slug">
          <input id="ex-country-slug" value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="uae" />
        </Field>
        <Field label="شهر (city)" htmlFor="ex-city">
          <input id="ex-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="مثال: دبی" />
        </Field>
        <Field label="نامک شهر (citySlug)" htmlFor="ex-city-slug">
          <input id="ex-city-slug" value={citySlug} onChange={(e) => setCitySlug(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="dubai" />
        </Field>
        <Field label="محل برگزاری (venue)" htmlFor="ex-venue">
          <input id="ex-venue" value={venue} onChange={(e) => setVenue(e.target.value)} className={inputCls} placeholder="مثال: مرکز تجارت جهانی دبی" />
        </Field>
        <Field label="وب‌سایت رسمی (officialWebsite)" htmlFor="ex-web">
          <input id="ex-web" value={officialWebsite} onChange={(e) => setOfficialWebsite(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="https://..." />
        </Field>
        <Field label="صنعت (industry)" htmlFor="ex-industry">
          <input id="ex-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} placeholder="مثال: فناوری اطلاعات" />
        </Field>
        <Field label="نامک صنعت (industrySlug)" htmlFor="ex-industry-slug">
          <input id="ex-industry-slug" value={industrySlug} onChange={(e) => setIndustrySlug(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="technology" />
        </Field>
        <Field label="تصویر (image)" htmlFor="ex-image">
          <input id="ex-image" value={image} onChange={(e) => setImage(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="https://..." />
        </Field>
        <Field label="نامک دوره (editionSlug)" htmlFor="ex-edition">
          <input id="ex-edition" value={editionSlug} onChange={(e) => setEditionSlug(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="2025" />
        </Field>
        <Field label="تاریخ شمسی (solarDate)" htmlFor="ex-solar">
          <input id="ex-solar" value={solarDate} onChange={(e) => setSolarDate(e.target.value)} className={inputCls} placeholder="مثال: ۲۲ تا ۲۶ مهر ۱۴۰۴" />
        </Field>
        <Field label="تاریخ میلادی (gregorianDate)" htmlFor="ex-greg">
          <input id="ex-greg" value={gregorianDate} onChange={(e) => setGregorianDate(e.target.value)} className={`${inputCls} text-left`} dir="ltr" placeholder="e.g. Oct 13-17, 2025" />
        </Field>
        <Field label="قیمت پایه (startingPrice)" htmlFor="ex-price">
          <input id="ex-price" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className={inputCls} placeholder="مثال: از ۴۵ میلیون تومان" />
        </Field>
        <Field label="وضعیت انتشار" htmlFor="ex-status" required>
          <select id="ex-status" value={status} onChange={(e) => setStatus(e.target.value as ExhibitionStatus)} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="شعار اصلی (heroTagline)" htmlFor="ex-tagline">
        <input id="ex-tagline" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} className={inputCls} placeholder="جمله کوتاه معرفی نمایشگاه..." />
      </Field>

      <Field label="توضیحات کامل (description)" htmlFor="ex-desc">
        <textarea id="ex-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} min-h-[80px]`} placeholder="معرفی کامل نمایشگاه..." />
      </Field>

      <Field label="مهلت ویزا (visaDeadline)" htmlFor="ex-visa">
        <textarea id="ex-visa" value={visaDeadline} onChange={(e) => setVisaDeadline(e.target.value)} className={`${inputCls} min-h-[60px]`} placeholder="توضیحات مربوط به مهلت و مدارک ویزا..." />
      </Field>

      <Field label="منطقه هتل (hotelArea)" htmlFor="ex-hotel">
        <textarea id="ex-hotel" value={hotelArea} onChange={(e) => setHotelArea(e.target.value)} className={`${inputCls} min-h-[60px]`} placeholder="توضیحات محل اقامت و منطقه هتل..." />
      </Field>

      <Field label="توضیح قیمت پایه (startingPriceNote)" htmlFor="ex-price-note">
        <textarea id="ex-price-note" value={startingPriceNote} onChange={(e) => setStartingPriceNote(e.target.value)} className={`${inputCls} min-h-[60px]`} placeholder="جزئیات قیمت و خدمات مشمول..." />
      </Field>

      <Field label="فازهای نمایشگاه (phases)" htmlFor="ex-phases" hint="آرایه JSON فازها - هر فاز شامل عنوان، تاریخ و توضیح">
        <textarea id="ex-phases" value={phasesJson} onChange={(e) => setPhasesJson(e.target.value)} className={`${inputCls} font-mono text-left text-caption min-h-[140px]`} dir="ltr" placeholder="[]" />
      </Field>

      <Field label="خدمات شامل تور (servicesIncluded)" htmlFor="ex-services" hint="آرایه JSON خدمات - لیست رشته‌ها یا آبجکت‌ها">
        <textarea id="ex-services" value={servicesJson} onChange={(e) => setServicesJson(e.target.value)} className={`${inputCls} font-mono text-left text-caption min-h-[120px]`} dir="ltr" placeholder="[]" />
      </Field>

      <Field label="نکات تجاری (businessTips)" htmlFor="ex-tips" hint="آرایه JSON نکات تجاری برای مسافران کاری">
        <textarea id="ex-tips" value={tipsJson} onChange={(e) => setTipsJson(e.target.value)} className={`${inputCls} font-mono text-left text-caption min-h-[120px]`} dir="ltr" placeholder="[]" />
      </Field>

      <Field label="پرسش‌های متداول (faqs)" htmlFor="ex-faqs" hint="آرایه JSON پرسش‌ها - هر آیتم شامل question, answer">
        <textarea id="ex-faqs" value={faqsJson} onChange={(e) => setFaqsJson(e.target.value)} className={`${inputCls} font-mono text-left text-caption min-h-[120px]`} dir="ltr" placeholder="[]" />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn btn-medium btn-primary text-btn font-bold" disabled={pending}>
          {pending ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-medium bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-tertiary"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
