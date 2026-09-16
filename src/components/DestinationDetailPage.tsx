import React, { useState } from 'react';
import { Phone, MapPin, Globe, Calendar, Clock, ShieldCheck, ChevronLeft, CheckCircle2, FileText, ArrowLeft, HelpCircle, Check, Send, AlertCircle } from 'lucide-react';
import { CITIES, COUNTRIES, Place } from '../data/destinationsData';
import { SAMPLE_TOURS } from '../data/toursData';
import TourListItem from './TourListItem';

interface DestinationDetailPageProps {
  countrySlug: string;
  placeSlug: string;
  onNavigate: (path: string) => void;
}

export default function DestinationDetailPage({ countrySlug, placeSlug, onNavigate }: DestinationDetailPageProps) {
  const city: Place | undefined = CITIES[placeSlug];
  const country: Place | undefined = COUNTRIES[countrySlug] || (city?.parentCountrySlug ? COUNTRIES[city.parentCountrySlug] : undefined);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passengers: '2',
    datePreference: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  if (!city) {
    return (
      <div className="container-main py-16 px-4 text-center dir-rtl">
        <h2 className="text-h3 font-bold mb-4">مقصد مورد نظر یافت نشد</h2>
        <button onClick={() => onNavigate('/destinations')} className="btn btn-primary btn-medium">
          بازگشت به فهرست مقصدها
        </button>
      </div>
    );
  }

  // Find tours matching this city
  const destinationTours = SAMPLE_TOURS.filter(t => t.destination.includes(city.name) || t.title.includes(city.name));

  // Alternative destinations
  const alternativeCities = Object.values(CITIES).filter(c => c.slug !== city.slug && c.category === city.category).slice(0, 3);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-caption text-text-secondary font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-brand-orange transition-colors">
              صفحه اصلی
            </button>
            <span className="text-text-muted">/</span>
            <button onClick={() => onNavigate('/destinations')} className="hover:text-brand-orange transition-colors">
              مقصدها
            </button>
            {country && (
              <>
                <span className="text-text-muted">/</span>
                <button onClick={() => onNavigate(`/destination/${country.slug}`)} className="hover:text-brand-orange transition-colors">
                  {country.name}
                </button>
              </>
            )}
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold">تور {city.name}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Top Hero Block ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-right">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-standard">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.parentCountryName || (country ? country.name : '')}</span>
                </span>
                {!city.visaRequired ? (
                  <span className="status status-success">بدون نیاز به ویزا</span>
                ) : (
                  <span className="status status-warning">نیازمند ویزا</span>
                )}
              </div>

              <h1 className="text-h1 text-text-heading font-extrabold mb-3">
                تور {city.name}؛ تاریخ‌ها، قیمت و شرایط سفر
              </h1>
              <p className="text-body text-text-secondary leading-relaxed mb-6">
                {city.description}
              </p>

              {/* Price & Basis Card */}
              <div className="p-4 bg-surface-secondary rounded-card border border-border-default/80 mb-6 text-right">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div>
                    <span className="text-caption text-text-secondary block">شروع قیمت پایه:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-h3 font-extrabold text-brand-orange">{city.startingPrice}</span>
                    </div>
                  </div>
                  <div className="text-left text-caption text-text-secondary">
                    <span>آخرین بررسی:</span>
                    <div className="font-bold text-text-heading">{city.lastVerifiedAt}</div>
                  </div>
                </div>
                <p className="text-caption text-text-secondary border-t border-border-default/40 pt-2">
                  مبنا: {city.startingPriceNote}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:02633350139"
                  className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold shadow-subtle"
                >
                  <Phone className="w-4 h-4" />
                  <span>استعلام و مشاوره تور {city.name}</span>
                </a>
                <a
                  href="#callback-form"
                  className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-2"
                >
                  <span>درخواست تماس کارشناس</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-card overflow-hidden border border-border-default shadow-card">
                <img
                  src={city.image}
                  alt={`تور ${city.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Active Tours List ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="text-right mb-6">
          <h2 className="text-h2 text-text-heading font-bold mb-1.5">
            پکیج‌ها و تورهای فعال {city.name}
          </h2>
          <p className="text-body-sm text-text-secondary">
            انتخاب هتل و پرواز را بررسی کنید و برای تایید نهایی قیمت و ظرفیت با کارشناس تماس بگیرید.
          </p>
        </div>

        {destinationTours.length > 0 ? (
          <div className="space-y-4">
            {destinationTours.map((tour) => (
              <TourListItem
                key={tour.id}
                id={tour.id}
                title={tour.title}
                image={tour.image}
                duration={tour.duration}
                badge={tour.badge}
                visaRequired={tour.visaRequired}
                price={tour.formattedPrice}
                pricePending={tour.status === 'pending'}
                closestDeparture={tour.closestDeparture}
                origin={tour.origin}
                onClick={() => onNavigate(`/tour/${tour.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-primary border border-border-default rounded-card p-8 text-center max-w-xl mx-auto">
            <p className="text-body font-bold text-text-heading mb-2">در حال حاضر پکیج گروهی فعالی در این تاریخ ثبت نشده است</p>
            <p className="text-body-sm text-text-secondary mb-4">
              امکان برنامه‌ریزی سفر انفرادی و استعلام پرواز و هتل دلخواه شما در {city.name} فراهم است.
            </p>
            <a href="tel:02633350139" className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>استعلام تور سفارشی {city.name}</span>
            </a>
          </div>
        )}
      </section>

      {/* ---------------- Districts & Selection Guide ---------------- */}
      {city.popularDistricts && city.popularDistricts.length > 0 && (
        <section className="bg-surface-primary border-y border-border-default section-standard">
          <div className="container-main px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-right mb-6">
              <h2 className="text-h2 text-text-heading font-bold mb-2">
                کدام منطقه {city.name} برای اقامت شما مناسب‌تر است؟
              </h2>
              <p className="text-body-sm text-text-secondary">
                موقعیت مکانی هتل مهم‌ترین عامل در مدیریت زمان و هزینه‌های رفت‌وآمد در {city.name} است.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {city.popularDistricts.map((district, idx) => (
                <div key={idx} className="bg-surface-secondary border border-border-default/60 rounded-control p-4 text-right">
                  <div className="w-7 h-7 rounded-small bg-brand-orange/10 text-brand-orange font-bold flex items-center justify-center mb-2 text-caption">
                    {idx + 1}
                  </div>
                  <h3 className="text-body font-bold text-text-heading mb-1">{district}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Destination Highlights & Practical Tips ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-primary border border-border-default rounded-card p-6 text-right">
            <h3 className="text-h3 font-bold text-text-heading mb-3">ویژگی‌های شاخص تور {city.name}</h3>
            <div className="space-y-2.5">
              {city.keyHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-center gap-2 text-body-sm text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6 text-right">
            <h3 className="text-h3 font-bold text-text-heading mb-3">نکات مهم پیش از سفر به {city.name}</h3>
            <div className="space-y-2.5">
              {city.travelTips.map((tip, idx) => (
                <div key={idx} className="p-3 bg-surface-secondary rounded-control text-caption text-text-secondary leading-relaxed">
                  💡 {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQs Section ---------------- */}
      {city.faqs && city.faqs.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-compact">
          <div className="text-right mb-6">
            <h3 className="text-h3 text-text-heading font-bold">سؤالات متداول مسافران تور {city.name}</h3>
          </div>
          <div className="space-y-3">
            {city.faqs.map((faq, idx) => (
              <div key={idx} className="bg-surface-primary border border-border-default rounded-card p-5 text-right">
                <h4 className="text-body font-bold text-text-heading mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-orange" />
                  <span>{faq.question}</span>
                </h4>
                <p className="text-body-sm text-text-secondary leading-relaxed mr-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Callback Request Form Section ---------------- */}
      <section id="callback-form" className="bg-surface-primary border-t border-border-default section-standard scroll-mt-12">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-6">
            <span className="badge badge-standard mb-2">ارتباط با کارشناس</span>
            <h3 className="text-h2 text-text-heading font-bold mb-2">ثبت درخواست تماس برای تور {city.name}</h3>
            <p className="text-body-sm text-text-secondary">
              نام و شماره تماس‌تان را وارد کنید. کارشناس تخصصی تور {city.name} در ساعات کاری با شما تماس می‌گیرد. ثبت این فرم به منزله رزرو قطعی یا پرداخت نیست.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center text-emerald-900">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-h4 font-bold mb-2">درخواست تماس شما با موفقیت ثبت شد</h4>
              <p className="text-body-sm text-emerald-800 mb-4">
                کارشناس ریوان سفر به زودی جهت هماهنگی قیمت و ظرفیت تور {city.name} با شما تماس خواهد گرفت.
              </p>
              <div className="text-caption text-emerald-700">
                در صورت نیاز فوری، مستقیماً با تلفن <a href="tel:02633350139" className="font-bold underline">۰۲۶۳۳۳۵۰۱۳۹</a> تماس بگیرید.
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-surface-secondary border border-border-default rounded-card p-6 text-right space-y-4">
              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: علی محمدی"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">شماره تماس همراه <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09123456789"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading text-right focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">تعداد مسافران</label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="w-full bg-surface-primary border border-border-default rounded-control px-3 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  >
                    <option value="1">۱ نفر</option>
                    <option value="2">۲ نفر (اتاق دو تخته)</option>
                    <option value="3">۳ نفر</option>
                    <option value="4+">۴ نفر به بالا (خانوادگی / گروهی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">تاریخ تقریبی سفر</label>
                  <input
                    type="text"
                    value={formData.datePreference}
                    onChange={(e) => setFormData({ ...formData, datePreference: e.target.value })}
                    placeholder="مثال: نیمه دوم شهریور"
                    className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">توضیحات یا نیازهای ویژه (اختیاری)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: ترجیح هتل ۵ ستاره نزدیک مترو، اتاق رو به دریا..."
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-medium btn-primary w-full text-btn font-bold inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{formLoading ? 'در حال ارسال درخواست...' : `ثبت درخواست مشاوره تور ${city.name}`}</span>
                </button>
              </div>

              <p className="text-[11px] text-text-secondary text-center">
                اطلاعات شما صرفاً جهت پیگیری همین سفر استفاده می‌شود و نزد ریوان سفر محفوظ است.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---------------- Alternative Destinations ---------------- */}
      {alternativeCities.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <h3 className="text-h3 text-text-heading font-bold mb-6 text-right">
            مقصدهای پیشنهادی دیگر
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {alternativeCities.map((alt) => (
              <div
                key={alt.id}
                onClick={() => onNavigate(`/destination/${alt.parentCountrySlug || alt.slug}/${alt.slug}`)}
                className="bg-surface-primary border border-border-default rounded-card p-4 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-4 text-right"
              >
                <div className="w-16 h-16 rounded-control overflow-hidden shrink-0">
                  <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-body font-bold text-text-heading">تور {alt.name}</h4>
                  <span className="text-caption text-brand-orange font-bold">{alt.startingPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
