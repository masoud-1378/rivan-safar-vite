import React, { useState, useEffect } from 'react';
import { 
  Phone, Calendar, Clock, MapPin, Plane, ShieldCheck, CheckCircle2, 
  XCircle, Building2, User, Send, Check, AlertCircle, HelpCircle, 
  ChevronLeft, ChevronRight, X, Play, Sparkles, FileText, ArrowRight, CalendarDays, FileCheck2,
  Headphones, Mic, Luggage, Wallet, BadgeCheck, Users, Star, MessageSquareHeart, Images
} from 'lucide-react';
import { type TourItem, TOUR_FAQ_ITEMS } from '../data/toursData';
import { useContent } from '@/src/lib/content-context';
import { useContact } from '@/src/lib/contact-context';
import { safeCreateLead } from '../lib/lead-submit-safe';
import { trackLeadSubmit } from '../lib/analytics';
import SmartImage from './SmartImage';
import { fa } from '@/lib/utils';
import { formatHotelStarsRange } from '@/lib/hotel-stars';
// تیم «فرم تورها»: رندر متن‌های غنی تور (description_rich / faqs / why_this_tour)
// با RichText + fallback متن تخت قدیمی.
import { RichText } from '@/components/ui/rich-editor/RichText';
import { faqRichAnswer, isRichEmpty, normalizeRichValue, richFallback, type JSONContent } from '@/lib/rich-text';
import {
  liveExtras, isDomesticTour, faDateTime, boardLabel,
  transportLabel, transportSpecLabel, isValidMobile, normalizeMobile,
  hotelPriceRows, bookingTypeLabel, findDestinationPlace, hasDestinationInfo,
} from './tour-live';

interface TourDetailPageProps {
  tourSlug: string;
  onNavigate: (path: string) => void;
}

type GalleryItem = NonNullable<TourItem['gallery']>[number];

/**
 * لایت‌باکس گالری ترکیبی (موج ۶): عکس و ویدیو را با ناوبری مشترک نشان می‌دهد.
 * راست‌چین: «بعدی» به سمت چپ است (ChevronLeft) و «قبلی» به سمت راست.
 */
function GalleryLightbox({
  items,
  index,
  fallbackAlt,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number;
  fallbackAlt: string;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];
  if (!item) return null;
  const isVideo = item.type === 'video';
  const count = items.length;
  const goNext = () => onNavigate((index + 1) % count);
  const goPrev = () => onNavigate((index - 1 + count) % count);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isVideo ? 'پخش ویدیو' : 'نمایش عکس'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl flex items-center justify-between mb-3">
        <span className="text-caption text-white/70">
          {fa(index + 1)} از {fa(count)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="min-w-11 min-h-11 grid place-items-center rounded-full text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="relative w-full max-w-4xl flex items-center justify-center">
        <button
          type="button"
          onClick={goPrev}
          aria-label="قبلی"
          className="absolute start-2 z-10 min-w-11 min-h-11 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        {isVideo ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-[70vh] w-auto max-w-full rounded-card"
            aria-label={item.caption || fallbackAlt}
          />
        ) : (
          <div className="relative w-full aspect-[16/10] max-h-[70vh]">
            <SmartImage src={item.url} alt={item.caption || fallbackAlt} className="object-contain" sizes="100vw" />
          </div>
        )}
        <button
          type="button"
          onClick={goNext}
          aria-label="بعدی"
          className="absolute end-2 z-10 min-w-11 min-h-11 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      {item.caption && <p className="mt-3 text-body-sm text-white/80 text-center">{item.caption}</p>}
    </div>
  );
}

export default function TourDetailPage({ tourSlug, onNavigate }: TourDetailPageProps) {
  const contact = useContact();
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const tour: TourItem | undefined = tours.find(t => t.id === tourSlug);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passengers: '2',
    hotelPreference: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStored, setSubmitStored] = useState(true);
  const [errors, setErrors] = useState({ name: '', phone: '' });
  const [formError, setFormError] = useState('');

  // موج ۶ — لایت‌باکس گالری ترکیبی (عکس + ویدیو)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryCount = tour?.gallery?.length ?? 0;

  useEffect(() => {
    if (lightboxIndex === null || galleryCount === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      // راست‌چین: «بعدی» به سمت چپ است، پس ArrowLeft یعنی جلو.
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i + 1) % galleryCount));
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i - 1 + galleryCount) % galleryCount));
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, galleryCount]);

  if (!tour) {
    return (
      <div className="container-main py-16 px-4 text-center">
        <h2 className="text-h3 font-bold mb-4">تور مورد نظر یافت نشد</h2>
        <button onClick={() => onNavigate('/tours')} className="btn btn-primary btn-medium">
          مشاهده فهرست تورها
        </button>
      </div>
    );
  }

  // Related tours
  const relatedTours = tours.filter(t => t.id !== tour.id && (t.destination === tour.destination || t.type === tour.type)).slice(0, 3);

  const isDomestic = isDomesticTour(tour);

  // فیلدهای زنده تورساز (بسته A) — همه اختیاری و دفاعی
  const extras = liveExtras(tour);
  const itineraryDays = (extras.itineraryDays || []).filter(
    (d) =>
      d &&
      (d.title ||
        (d.description || '').trim() ||
        !isRichEmpty(normalizeRichValue(d.descriptionRich as JSONContent | string | null | undefined)))
  );
  // متن‌های غنی تور (مایگریشن 0030) — خالی یعنی بخش نمایش داده نمی‌شود.
  const whyThisTourJson = normalizeRichValue(tour.whyThisTourRich);
  const hasWhyThisTour = !isRichEmpty(whyThisTourJson);
  const tourFaqs = (Array.isArray(tour.faqs) ? tour.faqs : [])
    .filter((f) => f && typeof f.question === 'string' && f.question.trim() !== '')
    .map((f) => ({
      question: f.question.trim(),
      answer: f.answer ?? '',
      answerRich: normalizeRichValue(faqRichAnswer(f)),
    }))
    .filter((f) => f.answer.trim() !== '' || !isRichEmpty(f.answerRich));
  // بلوک مالی واقعی (بسته A — موج ۳، مایگریشن 0027): همه اختیاری و دفاعی.
  // فقط چیزی که مدیر واقعاً وارد کرده نمایش داده می‌شود؛ پلهٔ ناقص (یکی از سه
  // عددش خالی) هرگز به مسافر نشان داده نمی‌شود.
  const trust = extras.trustSpecs || null;
  const hasTrust =
    !!trust &&
    !!(
      (trust.requiredDocs && trust.requiredDocs.length > 0) ||
      trust.returnGuarantee ||
      trust.cityTax ||
      trust.tipsNote ||
      trust.luggageKg ||
      trust.activityLevel
    );
  const consultant = extras.consultantSpec || null;
  const hasConsultant =
    !!consultant && !!(consultant.name || consultant.phone || consultant.audioUrl);
  const transportKind = extras.transportKind;

  /**
   * تیم ۶ (موج ۶، ایراد ۱۰): «وضعیت فروش» رفتار واقعی دارد — نشان و دکمه‌های
   * رزرو با هم عوض می‌شوند. لیبل‌ها همان CAPACITY_OPTIONS است و دست نخورده:
   * - pending «در انتظار تأیید ظرفیت»: نشان کهربایی؛ دکمهٔ اصلی «تماس و استعلام ظرفیت»
   * - confirmed «تأیید شده»: نشان سبز؛ دکمهٔ اصلی «تماس برای رزرو»
   * - full «تکمیل ظرفیت»: نشان قرمز؛ دکمهٔ اصلی غیرفعال؛ فقط «درخواست تماس» برای حرکت‌های بعدی
   * - updating «در حال به‌روزرسانی»: نشان کهربایی؛ دکمه‌ها فعال با لحن استعلام
   * فرم «درخواست تماس» همیشه همان است و هرگز «رزرو» نامیده نمی‌شود (قانون صفحه).
   */
  const saleStatus = tour.status ?? 'pending';
  const isSaleConfirmed = saleStatus === 'confirmed';
  const isSaleFull = saleStatus === 'full';
  const saleBadgeClass = isSaleConfirmed
    ? 'bg-brand-success/15 text-brand-success'
    : isSaleFull
      ? 'bg-destructive/15 text-destructive'
      : 'bg-brand-warning/15 text-brand-warning';
  const saleCtaLabel = isSaleConfirmed
    ? `تماس برای رزرو: ${contact.phoneDisplay}`
    : `تماس و استعلام ظرفیت: ${contact.phoneDisplay}`;

  const validateForm = () => {
    const errs = { name: '', phone: '' };
    if (formData.name.trim().length < 3) errs.name = 'نام و نام خانوادگی را کامل وارد کنید.';
    if (!isValidMobile(formData.phone)) errs.phone = 'شماره موبایل معتبر نیست؛ مثل ۰۹۱۲۳۴۵۶۷۸۹.';
    setErrors(errs);
    return !errs.name && !errs.phone;
  };

  // موج ۱ قلم ۱: رکورد مقصد برای بخش «اطلاعات کاربردی مقصد»؛ فقط وقتی رکورد
  // پیدا شود و دست‌کم یک فیلد کاربردی پر داشته باشد، بخش رندر می‌شود.
  const destPlace = findDestinationPlace(tour, { ...countries, ...cities });
  const hasDestInfo = !!destPlace && hasDestinationInfo(destPlace);
  const destTips = destPlace
    ? (destPlace.travelTips || []).filter((t) => t && t.trim()).slice(0, 4)
    : [];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;

    setFormLoading(true);
    const result = await safeCreateLead({
      fullName: formData.name.trim(),
      phone: normalizeMobile(formData.phone),
      sourcePath: `/tour/${tourSlug}`,
      tourContext: tour.title,
      destinationHint: tour.destination,
      passengers: formData.passengers,
      notes: [formData.hotelPreference && `هتل: ${formData.hotelPreference}`, formData.notes]
        .filter(Boolean)
        .join(' — '),
    });
    setFormLoading(false);
    if (result.ok) {
      setSubmitMessage(result.message);
      setSubmitStored(result.stored);
      setFormSubmitted(true);
      trackLeadSubmit(`/tour/${tourSlug}`, result.stored);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-caption text-text-secondary font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-brand-orange transition-colors">
              صفحه اصلی
            </button>
            <span aria-hidden="true" className="text-text-muted">/</span>
            <button onClick={() => onNavigate('/tours')} className="hover:text-brand-orange transition-colors">
              تورها
            </button>
            <span aria-hidden="true" className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold truncate max-w-[200px] sm:max-w-none">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Top Hero & Essential Tour Specs ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Main Column: Title, Quick Specs & Price (7 cols) */}
            <div className="lg:col-span-7 text-start">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-standard">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tour.destination}</span>
                </span>
                <span className="badge">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tour.duration}</span>
                </span>
                {tour.badge && (
                  <span className="badge badge-warning font-bold">
                    {tour.badge}
                  </span>
                )}
                {!isDomestic && (
                  !tour.visaRequired ? (
                    <span className="status status-success">بدون ویزا</span>
                  ) : (
                    <span className="status status-warning">نیازمند ویزا</span>
                  )
                )}
              </div>

              {/* Title */}
              <h1 className="text-h1 text-text-heading font-extrabold mb-3 leading-tight">
                {tour.title}
              </h1>

              <div className="text-body text-text-secondary leading-relaxed mb-6">
                <RichText value={richFallback(tour.descriptionRich, tour.description)} />
              </div>

              {/* Specifications Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-secondary rounded-card border border-border-default/80 mb-6 text-caption font-medium">
                <div>
                  <span className="text-text-muted block mb-0.5">شهر مبدأ:</span>
                  <span className="text-text-heading font-bold">{tour.origin}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">{transportSpecLabel(transportKind)}</span>
                  <span className="text-text-heading font-bold">{tour.airline?.trim() || transportLabel(transportKind)}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">نزدیک‌ترین حرکت:</span>
                  <span className="text-text-heading font-bold">{tour.closestDeparture || 'هفتگی / منظم'}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">درجه هتل‌ها:</span>
                  <span className="text-text-heading font-bold">{formatHotelStarsRange((tour.hotelOptions ?? []).map((o) => o.stars), tour.hotelStars)}</span>
                </div>
              </div>

              {/* موج ۱ قلم ۱: مسیر پرواز — فیلد route دیتابیس که فقط در مودال
                  فهرست تورها نمایش داده می‌شد. (جدول routeSegments خالی است؛
                  رندر سگمنتی ممکن نیست و چیزی حدس زده نمی‌شود.) */}
              {tour.route?.trim() && (
                <div className="flex items-center gap-2 mb-6 text-body-sm">
                  <Plane className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="text-text-muted font-medium">
                    {transportKind === 'air' ? 'مسیر پرواز:' : 'مسیر سفر:'}
                  </span>
                  <span className="text-text-heading font-bold">{tour.route}</span>
                </div>
              )}

              {/* Price & Status Card */}
              <div className="p-5 bg-surface-secondary/80 rounded-card border border-border-default mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
                  <div>
                    <span className="text-caption text-text-secondary block mb-1">شروع قیمت پایه:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-h2 font-extrabold text-brand-orange-strong">
                        {tour.formattedPrice}
                      </span>
                      <span className="text-body font-bold text-text-secondary">تومان</span>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-caption font-bold ${saleBadgeClass}`}>
                      {tour.statusLabel}
                    </span>
                    <div className="text-caption text-text-secondary mt-1">{faDateTime(tour.updatedAt) ?? '—'}</div>
                  </div>
                </div>

                <p className="text-caption text-text-secondary border-t border-border-default/40 pt-2.5">
                  مبنای قیمت: {tour.priceNote}
                </p>
              </div>

              {/* Call to Action Buttons — رفتار واقعیِ «وضعیت فروش» (ایراد ۱۰):
                  «تکمیل ظرفیت» دکمهٔ اصلی را غیرفعال می‌کند و فقط راه «درخواست
                  تماس» برای حرکت‌های بعدی می‌ماند. */}
              <div className="flex flex-wrap items-center gap-3">
                {isSaleFull ? (
                  <button
                    type="button"
                    disabled
                    className="btn btn-medium inline-flex items-center gap-2.5 font-bold"
                  >
                    <Phone className="w-4 h-4" />
                    <span>تکمیل ظرفیت</span>
                  </button>
                ) : (
                  <a
                    href={contact.phoneHref}
                    className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2.5 font-bold shadow-subtle"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{saleCtaLabel}</span>
                  </a>
                )}
                <a
                  href="#booking-form"
                  className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-2"
                >
                  <span>ثبت فرم درخواست تماس</span>
                </a>
              </div>
              {isSaleFull && (
                <p className="text-caption text-text-secondary mt-3">
                  ظرفیت این تور پر شده است؛ برای اطلاع از حرکت‌های بعدی درخواست تماس ثبت کنید.
                </p>
              )}
            </div>

            {/* Right Column: Hero Image (5 cols) */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-card overflow-hidden border border-border-default shadow-card relative">
                <SmartImage
                  src={tour.image}
                  alt={tour.title}
                  priority
                  className="object-cover"
                />
              </div>

              {/* Key Guarantee Box */}
              <div className="mt-4 p-4 bg-surface-primary rounded-card border border-border-default text-start space-y-2 text-caption text-text-secondary">
                <div className="flex items-center gap-2 text-text-heading font-bold">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  <span>شفافیت خدمات ریوان سفر</span>
                </div>
                <p className="leading-relaxed">
                  همهٔ موارد هتل، پرواز، ترانسفر و بیمه در قرارداد رسمی گردشگری به‌صورت مکتوب قید می‌شود.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- چرا همین تور (تیم «فرم تورها»؛ فقط وقتی داده هست) ---------------- */}
      {hasWhyThisTour && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="bg-surface-primary border border-border-default rounded-card p-5 md:p-6 shadow-subtle">
            <div className="text-right mb-4">
              <h2 className="text-h2 text-text-heading font-bold mb-1.5">
                چرا همین تور؟
              </h2>
              <p className="text-body-sm text-text-secondary">
                نکته‌هایی که این تور را از تورهای مشابه جدا می‌کند.
              </p>
            </div>
            <div className="text-body-sm text-text-secondary leading-relaxed">
              <RichText value={whyThisTourJson} />
            </div>
          </div>
        </section>
      )}

      {/* ---------------- برنامه روزبه‌روز (از تورساز؛ فقط وقتی داده هست) ---------------- */}
      {itineraryDays.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="text-start mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-1.5">
              برنامه روزبه‌روز سفر
            </h2>
            <p className="text-body-sm text-text-secondary">
              هر روز این تور چه می‌گذرد — از حرکت تا بازگشت.
            </p>
          </div>

          <div className="space-y-4">
            {itineraryDays.map((day) => (
              <div
                key={day.day}
                className="bg-surface-primary border border-border-default rounded-card p-5 shadow-subtle"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-brand-orange/10 text-brand-orange border border-brand-orange/30 rounded-full px-3 py-1 text-caption font-extrabold">
                    <CalendarDays className="w-3.5 h-3.5" />
                    روز {fa(day.day)}
                  </span>
                  {day.city && (
                    <span className="inline-flex items-center gap-1 text-caption text-text-secondary font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      {day.city}
                    </span>
                  )}
                </div>
                {day.title && (
                  <h3 className="text-body font-bold text-text-heading mb-1.5">{day.title}</h3>
                )}
                {((day.description || '').trim() || !isRichEmpty(normalizeRichValue(day.descriptionRich as JSONContent | string | null | undefined))) && (
                  <div className="text-body-sm text-text-secondary leading-relaxed">
                    <RichText value={richFallback(day.descriptionRich, day.description)} />
                  </div>
                )}
                {day.meals && (
                  <p className="text-caption text-text-muted mt-2">
                    وعده‌های غذایی: {day.meals}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- سوالات پرتکرار این تور (تیم «فرم تورها»؛ فقط وقتی داده هست) ---------------- */}
      {tourFaqs.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="bg-surface-primary border border-border-default rounded-card p-5 md:p-6 shadow-subtle">
            <div className="text-right mb-5">
              <h2 className="text-h2 text-text-heading font-bold mb-1.5">
                سوالات پرتکرار
              </h2>
              <p className="text-body-sm text-text-secondary">
                پاسخ سؤال‌هایی که مسافرها دربارهٔ همین تور زیاد می‌پرسند.
              </p>
            </div>
            <div className="space-y-2.5">
              {tourFaqs.map((f, i) => (
                <details
                  key={i}
                  className="rounded-control border border-border-default/70 bg-surface-secondary/40 px-4 py-3"
                >
                  <summary className="cursor-pointer text-body-sm font-bold text-text-heading">
                    {f.question}
                  </summary>
                  <div className="pt-2 text-body-sm text-text-secondary leading-relaxed">
                    <RichText value={richFallback(f.answerRich, f.answer)} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Hotel Options Table ---------------- */}
      {tour.hotelOptions && tour.hotelOptions.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="text-start mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-1.5">
              گزینه‌های هتل و قیمت برای هر نفر
            </h2>
            <p className="text-body-sm text-text-secondary">
              امکان انتخاب هتل دلخواه بر اساس بودجه و منطقه اقامت فراهم است.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-body-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border-default text-text-heading font-bold">
                    <th className="py-3.5 px-4 sm:px-6">نام هتل</th>
                    <th className="py-3.5 px-4 text-center">ستاره</th>
                    <th className="py-3.5 px-4 text-center">نوع پذیرایی</th>
                    <th className="py-3.5 px-4 sm:px-6 text-end">قیمت برای هر نفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60">
                  {tour.hotelOptions.map((opt, idx) => {
                    // موج ۱ قلم ۱: تفکیک نرخ اتاق‌ها و نوع رزرو از دادهٔ تورساز
                    // مرحلهٔ ۲ — فقط فیلدهای پر نمایش داده می‌شوند.
                    const priceRows = hotelPriceRows(opt);
                    const booking = bookingTypeLabel(opt.bookingType);
                    return (
                      <tr key={idx} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-bold text-text-heading">
                          <div className="flex items-center gap-2 flex-wrap">
                            {opt.photoUrl ? (
                              <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-sm">
                                <SmartImage src={opt.photoUrl} alt={opt.name} />
                              </span>
                            ) : (
                              <Building2 className="w-4 h-4 text-text-muted" />
                            )}
                            <span>{opt.name}</span>
                            {booking && (
                              <span className="inline-flex px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-caption border border-sky-200">
                                رزرو {booking}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-caption border border-amber-200">
                            {opt.stars ? `${fa(opt.stars)} ستاره` : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-text-secondary">
                          {boardLabel(opt.board)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-left">
                          {priceRows.length === 0 ? (
                            <span className="font-extrabold text-brand-orange">
                              {opt.pricePerPerson?.trim() ? opt.pricePerPerson : '—'}
                            </span>
                          ) : priceRows.length === 1 ? (
                            <span className="font-extrabold text-brand-orange">
                              {priceRows[0].value}
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              {priceRows.map((row, i) => (
                                <div key={i} className={i === 0 ? 'font-extrabold text-brand-orange' : ''}>
                                  <span className="block text-caption text-text-muted font-medium">
                                    {row.label}
                                  </span>
                                  <span className={i === 0 ? '' : 'text-body-sm font-bold text-text-heading'}>
                                    {row.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- اطلاعات کاربردی مقصد (از رکورد مقصد؛ فقط وقتی داده هست) ---------------- */}
      {hasDestInfo && destPlace && (
        <section className="bg-surface-secondary/60 border-y border-border-default section-standard">
          <div className="container-main px-4 sm:px-6 lg:px-8">
            <div className="text-right mb-6">
              <h2 className="text-h2 text-text-heading font-bold mb-1.5">
                اطلاعات کاربردی {destPlace.name}
              </h2>
              <p className="text-body-sm text-text-secondary">
                آنچه پیش از سفر به {destPlace.name} بد نیست بدانید.
                {destPlace.lastVerifiedAt?.trim() && (
                  <span className="text-caption text-text-muted"> (آخرین بازبینی: {destPlace.lastVerifiedAt})</span>
                )}
              </p>
            </div>

            <div className="bg-surface-primary border border-border-default rounded-card p-6 shadow-subtle">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-right">
                {destPlace.currency?.trim() && (
                  <div>
                    <dt className="text-caption text-text-muted font-bold mb-0.5 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      واحد پول
                    </dt>
                    <dd className="text-body-sm font-bold text-text-heading">{destPlace.currency}</dd>
                  </div>
                )}
                {destPlace.bestSeason?.trim() && (
                  <div>
                    <dt className="text-caption text-text-muted font-bold mb-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      بهترین فصل سفر
                    </dt>
                    <dd className="text-body-sm font-bold text-text-heading">{destPlace.bestSeason}</dd>
                  </div>
                )}
                {destPlace.flightDuration?.trim() && (
                  <div>
                    <dt className="text-caption text-text-muted font-bold mb-0.5 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5" />
                      مدت پرواز
                    </dt>
                    <dd className="text-body-sm font-bold text-text-heading">{destPlace.flightDuration}</dd>
                  </div>
                )}
                {destPlace.visaType?.trim() && (
                  <div>
                    <dt className="text-caption text-text-muted font-bold mb-0.5 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      وضعیت ویزا
                    </dt>
                    <dd className="text-body-sm font-bold text-text-heading">{destPlace.visaType}</dd>
                  </div>
                )}
              </dl>

              {destTips.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border-default/60">
                  <h3 className="text-body font-bold text-text-heading mb-3">نکته‌های سفر</h3>
                  <ul className="space-y-2.5">
                    {destTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Included & Excluded Services ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-standard">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Included Services */}
            <div className="bg-surface-secondary/60 border border-border-default rounded-card p-6 text-start">
              <div className="flex items-center gap-2 text-h3 text-text-heading font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 text-brand-success" />
                <h3>خدمات شامل تور</h3>
              </div>
              <ul className="space-y-3 text-body-sm text-text-primary font-medium">
                {tour.includedServices.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excluded Services */}
            <div className="bg-surface-secondary/60 border border-border-default rounded-card p-6 text-start">
              <div className="flex items-center gap-2 text-h3 text-text-heading font-bold mb-4">
                <XCircle className="w-5 h-5 text-text-muted" />
                <h3>خدمات غیرشامل (به عهده مسافر)</h3>
              </div>
              <ul className="space-y-3 text-body-sm text-text-secondary">
                {tour.excludedServices.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0 mt-2"></span>
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- Important Policies (Child, Visa, Cancellation) ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
          
          {hasTrust && trust ? (
            <div className="bg-surface-primary border border-border-default rounded-card p-6">
              <h3 className="text-h4 font-bold text-text-heading mb-1.5">مدارک و هزینه‌های سفر</h3>
              <p className="text-caption text-text-muted mb-4">
                چک‌لیستی که کارشناس تور برای همین سفر تنظیم کرده است.
              </p>
              {trust.requiredDocs && trust.requiredDocs.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {trust.requiredDocs.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-body-sm text-text-heading">
                      <FileCheck2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              )}
              <dl className="space-y-2.5 text-caption">
                {trust.returnGuarantee && (
                  <div className="flex items-start gap-2">
                    <dt className="text-text-muted font-bold shrink-0">تضمین بازگشت:</dt>
                    <dd className="text-text-secondary leading-relaxed">{trust.returnGuarantee}</dd>
                  </div>
                )}
                {trust.cityTax && (
                  <div className="flex items-start gap-2">
                    <dt className="text-text-muted font-bold shrink-0">مالیات شهری:</dt>
                    <dd className="text-text-secondary leading-relaxed">{trust.cityTax}</dd>
                  </div>
                )}
                {trust.tipsNote && (
                  <div className="flex items-start gap-2">
                    <dt className="text-text-muted font-bold shrink-0">انعام:</dt>
                    <dd className="text-text-secondary leading-relaxed">{trust.tipsNote}</dd>
                  </div>
                )}
                {!!trust.luggageKg && (
                  <div className="flex items-start gap-2">
                    <dt className="text-text-muted font-bold shrink-0">بار مجاز:</dt>
                    <dd className="text-text-secondary">{fa(trust.luggageKg)} کیلوگرم</dd>
                  </div>
                )}
                {trust.activityLevel && (
                  <div className="flex items-start gap-2">
                    <dt className="text-text-muted font-bold shrink-0">سطح تحرک:</dt>
                    <dd className="text-text-secondary">
                      {trust.activityLevel === 'easy' ? 'سبک و خانوادگی'
                        : trust.activityLevel === 'moderate' ? 'متوسط'
                        : trust.activityLevel === 'demanding' ? 'پرانرژی و فعال'
                        : trust.activityLevel}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="bg-surface-primary border border-border-default rounded-card p-6">
              <h3 className="text-h4 font-bold text-text-heading mb-2">شرایط و مدارک سفر</h3>
              <p className="text-caption text-text-secondary leading-relaxed">
                {isDomestic
                  ? 'برای این تور داخلی، همراه داشتن کارت ملی هوشمند و شناسنامه معتبر برای پذیرش پرواز و تحویل اتاق در هتل الزامی است.'
                  : tour.visaRequired 
                    ? 'این تور نیازمند ویزا است. مدارک لازم شامل گذرنامه با ۷ ماه اعتبار و مدارک شغلی/تمکن را کارشناس اخذ می‌کند.'
                    : 'این مقصد نیازی به اخذ ویزا ندارد. داشتن گذرنامه با حداقل ۶ ماه اعتبار الزامی است.'}
              </p>
            </div>
          )}

          {/* بلوک مالی واقعی (موج ۳): کارت «شرایط کنسلی و پیش‌پرداخت» — فقط دادهٔ
              واقعی‌ای که مدیر در مرحلهٔ ۶ وارد کرده. پلهٔ ناقص هرگز نمایش داده
              نمی‌شود؛ خالی بودن همه‌چیز یعنی کارت اصلاً رندر نمی‌شود. */}
          {(() => {
            const fin = tour.financialSpecs;
            const tiers = (Array.isArray(fin?.cancellationTiers) ? fin!.cancellationTiers! : []).filter(
              (t) =>
                typeof t?.fromDays === 'number' && Number.isFinite(t.fromDays) &&
                typeof t?.toDays === 'number' && Number.isFinite(t.toDays) &&
                typeof t?.penaltyPercent === 'number' && Number.isFinite(t.penaltyPercent)
            );
            const visaNote = fin?.visaRejectionNote?.trim();
            const deposit = fin?.depositAmount?.trim();
            const deadline = fin?.depositDeadline?.trim();
            if (tiers.length === 0 && !visaNote && !deposit) return null;
            return (
              <div className="bg-surface-primary border border-border-default rounded-card p-6">
                <h3 className="text-h4 font-bold text-text-heading mb-4">شرایط کنسلی و پیش‌پرداخت</h3>
                {tiers.length > 0 && (
                  <>
                    <p className="text-caption font-bold text-text-heading mb-2">جریمهٔ کنسلی پلکانی</p>
                    <ul className="space-y-2 mb-4">
                      {tiers.map((t, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 text-body-sm border-b border-border-default/60 pb-2 last:border-0 last:pb-0">
                          <span className="text-text-secondary">از {fa(t.fromDays!)} تا {fa(t.toDays!)} روز مانده به حرکت</span>
                          <span className="font-bold text-text-heading shrink-0">{fa(t.penaltyPercent!)}٪ جریمه</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <dl className="space-y-2.5 text-caption">
                  {visaNote && (
                    <div className="flex items-start gap-2">
                      <dt className="text-text-muted font-bold shrink-0">در صورت رد ویزا:</dt>
                      <dd className="text-text-secondary leading-relaxed">{visaNote}</dd>
                    </div>
                  )}
                  {deposit && (
                    <div className="flex items-start gap-2">
                      <dt className="text-text-muted font-bold shrink-0">پیش‌پرداخت:</dt>
                      <dd className="text-text-secondary leading-relaxed">
                        {deposit}{deadline ? ` — مهلت تسویه: ${deadline}` : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ---------------- Callback Request Form (Strictly "درخواست تماس", never "رزرو") ---------------- */}
      <section id="booking-form" className="bg-surface-primary border-t border-border-default section-standard scroll-mt-28">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-6">
            <span className="badge badge-standard mb-2">پیگیری با کارشناس</span>
            <h3 className="text-h2 text-text-heading font-bold mb-2">ثبت درخواست تماس برای {tour.title}</h3>
            <p className="text-body-sm text-text-secondary">
              نام و شماره تماس خود را وارد کنید. کارشناس تخصصی ریوان سفر برای بررسی نهایی ظرفیت، پرواز و هتل با شما تماس خواهد گرفت. ثبت این فرم تعهد پرداخت ایجاد نمی‌کند.
            </p>
          </div>

          {formSubmitted ? (
            submitStored ? (
              <div className="bg-brand-success-soft border border-brand-success/25 rounded-card p-6 text-center text-text-primary">
                <div className="w-12 h-12 rounded-full bg-brand-success/15 text-brand-success flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-h4 font-bold mb-2">درخواست تماس شما ثبت شد</h4>
                <p className="text-body-sm text-brand-success mb-4">
                  {submitMessage || `کارشناس ریوان سفر در ساعات کاری برای تأیید قیمت و ظرفیت ${tour.title} با شما تماس می‌گیرد.`}
                </p>
                <div className="text-caption text-brand-success">
                  در صورت تمایل می‌توانید مستقیماً با تلفن <a href={contact.phoneHref} className="font-bold underline">{contact.phoneDisplay}</a> تماس حاصل فرمایید.
                </div>
              </div>
            ) : (
              <div className="bg-brand-warning-soft border border-brand-warning/25 rounded-card p-6 text-center text-text-primary">
                <div className="w-12 h-12 rounded-full bg-brand-warning/15 text-brand-warning flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="text-h4 font-bold mb-2">ثبت آنلاین ممکن نشد</h4>
                <p className="text-body-sm text-brand-warning mb-4">
                  {submitMessage}
                </p>
                <div className="text-caption text-brand-warning">
                  برای پیگیری سریع، لطفاً با تلفن <a href={contact.phoneHref} className="font-bold underline">{contact.phoneDisplay}</a> تماس بگیرید.
                </div>
              </div>
            )
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-surface-secondary border border-border-default rounded-card p-6 text-start space-y-4">
              {formError && (
                <div className="p-3 bg-danger-soft border border-danger/25 rounded-control text-danger text-body-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">نام و نام خانوادگی <span className="text-danger">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مریم کریمی"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-form-input text-text-heading focus:border-brand-orange focus:shadow-focus focus:outline-none"
                />
                {errors.name && <p className="text-caption text-danger mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">شماره موبایل <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-form-input text-text-heading text-start focus:border-brand-orange focus:shadow-focus focus:outline-none"
                />
                {errors.phone && <p className="text-caption text-danger mt-1">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">تعداد مسافران</label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="w-full bg-surface-primary border border-border-default rounded-control px-3 py-2.5 text-form-input text-text-heading focus:border-brand-orange focus:shadow-focus focus:outline-none"
                  >
                    <option value="1">۱ نفر (اتاق یک تخته)</option>
                    <option value="2">۲ نفر (اتاق دو تخته)</option>
                    <option value="3">۳ نفر (اتاق سه تخته / کاناپه)</option>
                    <option value="4+">۴ نفر به بالا (خانوادگی / گروهی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">هتل مد نظر (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.hotelPreference}
                    onChange={(e) => setFormData({ ...formData, hotelPreference: e.target.value })}
                    placeholder="مثال: هتل ۵ ستاره یا نام هتل"
                    className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-form-input text-text-heading focus:border-brand-orange focus:shadow-focus focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">توضیحات و نیازمندی‌ها (اختیاری)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: تاریخ ترجیحی حرکت، سن همراهان کودک، درخواست گشت شهری اضافه…"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2 text-form-input text-text-heading focus:border-brand-orange focus:shadow-focus focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-medium btn-primary w-full text-btn font-bold inline-flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Send className="w-4 h-4" />
                  <span>{formLoading ? 'در حال ارسال درخواست…' : 'ثبت درخواست استعلام قیمت و ظرفیت'}</span>
                </button>
              </div>

              <p className="text-[11px] text-text-secondary text-center">
                این فرم صرفاً ثبت درخواست بررسی کارشناسی است و هیچ‌گونه رزرو قطعی یا پرداخت محسوب نمی‌شود.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---------------- کارشناس تور (از تورساز؛ فقط وقتی داده هست) ---------------- */}
      {hasConsultant && consultant && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="bg-surface-primary border border-brand-orange/30 rounded-card p-6 shadow-subtle">
            <div className="flex items-center gap-2 mb-1.5">
              <Headphones className="w-5 h-5 text-brand-orange" />
              <h2 className="text-h3 text-text-heading font-bold">کارشناس این تور</h2>
            </div>
            <p className="text-body-sm text-text-secondary mb-5">
              برای سؤال تخصصی درباره همین تور، مستقیم با کارشناسش حرف بزنید.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  {consultant.name && (
                    <div className="text-body font-bold text-text-heading flex items-center gap-1.5">
                      {consultant.name}
                      <BadgeCheck className="w-4 h-4 text-brand-orange" />
                    </div>
                  )}
                  {consultant.title && (
                    <div className="text-caption text-text-muted">{consultant.title}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
                {consultant.phone && (
                  <a
                    href={`tel:${consultant.phone.replace(/[^\d+]/g, '')}`}
                    className="btn btn-primary btn-medium text-btn font-bold inline-flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    تماس با کارشناس
                  </a>
                )}
                {consultant.emergencyPhone && (
                  <span className="text-caption text-text-secondary">
                    تلفن اضطراری سفر:{' '}
                    <a
                      href={`tel:${consultant.emergencyPhone.replace(/[^\d+]/g, '')}`}
                      dir="ltr"
                      className="font-bold text-text-heading underline"
                    >
                      {consultant.emergencyPhone}
                    </a>
                  </span>
                )}
              </div>
            </div>

            {consultant.audioUrl && (
              <div className="mt-5 pt-5 border-t border-border-default/60">
                <div className="flex items-center gap-2 mb-2.5">
                  <Mic className="w-4 h-4 text-text-secondary" />
                  <span className="text-caption font-bold text-text-heading">
                    پادکست معرفی تور — از زبان کارشناس
                  </span>
                </div>
                <audio controls src={consultant.audioUrl} className="w-full" preload="none">
                  مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                </audio>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------- تورلیدر (موج ۴؛ فقط وقتی ثبت شده) ---------------- */}
      {tour.leader && tour.leader.name && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="bg-surface-primary border border-border-default rounded-card p-6 shadow-subtle">
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-5 h-5 text-brand-orange" />
              <h2 className="text-h3 text-text-heading font-bold">تورلیدر شما</h2>
            </div>
            <p className="text-body-sm text-text-secondary mb-5">
              کسی که در این سفر همراهتان است.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {tour.leader.photo ? (
                <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
                  <SmartImage src={tour.leader.photo} alt={tour.leader.name} className="object-cover" sizes="80px" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                  <Users className="w-9 h-9" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-body font-bold text-text-heading flex items-center gap-1.5">
                  {tour.leader.name}
                  <BadgeCheck className="w-4 h-4 text-brand-orange" />
                </div>
                {tour.leader.languages && (
                  <div className="text-caption text-text-secondary mt-0.5">زبان‌ها: {tour.leader.languages}</div>
                )}
                {tour.leader.joinMode && (
                  <div className="text-caption text-text-secondary mt-0.5">
                    {tour.leader.joinMode === 'at_destination' ? 'در مقصد به گروه می‌پیوندد' : 'از مبدأ همراه گروه است'}
                  </div>
                )}
                {tour.leader.bio && (
                  <p className="text-body-sm text-text-secondary mt-2">{tour.leader.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- نظر مسافران (موج ۴؛ فقط وقتی نظر تأییدشده هست) ---------------- */}
      {tour.reviews && tour.reviews.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareHeart className="w-5 h-5 text-brand-orange" />
            <h2 className="text-h3 text-text-heading font-bold">نظر مسافران این تور</h2>
          </div>
          {tour.ratingSummary && (
            <div className="flex items-center gap-2 mb-5" dir="ltr">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= Math.round(tour.ratingSummary!.avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                  />
                ))}
              </div>
              <span className="text-body-sm font-bold text-text-heading">{fa(tour.ratingSummary.avg)}</span>
              <span className="text-caption text-text-secondary">از {fa(tour.ratingSummary.count)} نظر</span>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {tour.reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="bg-surface-primary border border-border-default rounded-card p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-body-sm font-bold text-text-heading">{r.name}</span>
                  <div className="flex items-center gap-0.5" dir="ltr">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-body-sm text-text-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- گالری واقعی (موج ۴ عکس؛ موج ۶ ترکیبی عکس+ویدیو) ---------------- */}
      {tour.gallery && tour.gallery.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="flex items-center gap-2 mb-1">
            <Images className="w-5 h-5 text-brand-orange" />
            <h2 className="text-h3 text-text-heading font-bold">گالری واقعی</h2>
          </div>
          <p className="text-body-sm text-text-secondary mb-5">
            {tour.gallery.some((g) => g.type === 'video')
              ? 'عکس‌ها و ویدیوهای واقعی همین تور و مقصد، نه تبلیغاتی.'
              : 'عکس‌های واقعی همین تور و مقصد، نه تبلیغاتی.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tour.gallery.map((g, i) => {
              const isVideo = g.type === 'video';
              // نقد بصری: همهٔ تایل‌ها ۴:۳ یکدست می‌مانند (مثل عکس‌ها)؛ نسبت
              // واقعی ویدیو فقط در لایت‌باکس دیده می‌شود تا ریتم گرید نشکند.
              return (
                <figure
                  key={i}
                  className="rounded-card overflow-hidden border border-border-default bg-surface-primary"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative block w-full cursor-pointer group aspect-[4/3]"
                    aria-label={isVideo ? `پخش ویدیو: ${g.caption || tour.title}` : `بزرگ‌نمایی عکس: ${g.caption || tour.title}`}
                  >
                    {isVideo ? (
                      <video
                        src={g.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover"
                        aria-hidden
                      />
                    ) : (
                      <SmartImage
                        src={g.url}
                        alt={g.caption || tour.title}
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    )}
                    {isVideo && (
                      <>
                        <span className="absolute inset-0 grid place-items-center" aria-hidden>
                          <span className="rounded-full bg-black/60 p-3 transition-transform group-hover:scale-110">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </span>
                        </span>
                        <span className="absolute top-2 start-2 rounded-sm bg-black/60 px-1.5 py-0.5 text-caption text-white">
                          ویدیو
                        </span>
                      </>
                    )}
                  </button>
                  {g.caption && (
                    <figcaption className="text-caption text-text-secondary p-2">{g.caption}</figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* لایت‌باکس گالری — عکس و ویدیو (موج ۶) */}
      {tour.gallery && lightboxIndex !== null && (
        <GalleryLightbox
          items={tour.gallery}
          index={lightboxIndex}
          fallbackAlt={tour.title}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}

      {/* ---------------- Related Tours ---------------- */}
      {relatedTours.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <h3 className="text-h3 text-text-heading font-bold mb-6 text-start">
            تورهای مشابه پیشنهادی
          </h3>

          <div className="space-y-4">
            {relatedTours.map((rel) => (
              <a
                key={rel.id}
                href={`/tour/${rel.id}`}
                onClick={(e) => { e.preventDefault(); onNavigate(`/tour/${rel.id}`); }}
                className="bg-surface-primary border border-border-default rounded-card p-4 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 text-start"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-control overflow-hidden shrink-0 relative">
                    <SmartImage src={rel.image} alt={rel.title} className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <h4 className="text-body font-bold text-text-heading">{rel.title}</h4>
                    <span className="text-caption text-text-secondary">{rel.duration} · {rel.origin}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border-default/40">
                  <div className="text-end">
                    <span className="text-caption text-text-secondary block">شروع قیمت از:</span>
                    <span className="text-body font-extrabold text-brand-orange">{rel.formattedPrice} تومان</span>
                  </div>
                  <span className="btn btn-secondary btn-small text-caption">مشاهده تور</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
