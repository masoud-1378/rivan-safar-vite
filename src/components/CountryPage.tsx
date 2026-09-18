import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Sparkles,
  Send,
  Compass,
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import { COUNTRIES, CITIES, Place } from '../data/destinationsData';
import { SAMPLE_TOURS } from '../data/toursData';
import TourListItem from './TourListItem';

interface CountryPageProps {
  countrySlug: string;
  onNavigate: (path: string) => void;
}

export default function CountryPage({ countrySlug, onNavigate }: CountryPageProps) {
  const country: Place | undefined = COUNTRIES[countrySlug];

  // Component state
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]); // First FAQ open by default
  
  // Quick Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!country) {
    return (
      <div className="container-main py-16 px-4 text-center dir-rtl">
        <div className="max-w-md mx-auto bg-surface-primary border border-border-default rounded-card p-8 shadow-card">
          <Globe className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-h3 font-bold text-text-heading mb-2">کشور مورد نظر یافت نشد</h2>
          <p className="text-body-sm text-text-secondary mb-6">
            صفحه مورد نظر شما ممکن است تغییر کرده باشد یا موقتاً در دسترس نباشد.
          </p>
          <button onClick={() => onNavigate('/destinations')} className="btn btn-primary btn-medium w-full">
            بازگشت به فهرست مقصدها
          </button>
        </div>
      </div>
    );
  }

  // Find cities belonging to this country
  const cities = Object.values(CITIES).filter(c => c.parentCountrySlug === country.slug);

  // Find tours for this country
  const tours = SAMPLE_TOURS.filter(t => {
    return cities.some(c => c.name === t.destination) || t.destination.includes(country.name);
  });

  // Toggle FAQ accordion item
  const toggleFaq = (index: number) => {
    setOpenFaqIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Handle Quick Inquiry Submit
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryPhone.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      
      {/* ---------------- 1. Breadcrumb ---------------- */}
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
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold">تور {country.name}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- 2. Modern Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default pt-8 pb-10">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right Column: Key Details & Actions */}
            <div className="lg:col-span-7 text-right">
              
              {/* Simple Clean Headline */}
              <h1 className="text-h1 text-text-heading font-extrabold mb-3 leading-tight">
                تور {country.name}
              </h1>

              {/* Lead Paragraph */}
              <p className="text-body text-text-secondary leading-relaxed mb-6">
                {country.description}
              </p>

              {/* Focused Starting Price Box */}
              <div className="p-4 bg-surface-secondary rounded-card border border-border-default/80 mb-6 text-right max-w-md">
                <span className="text-caption text-text-muted block mb-0.5">شروع قیمت پکیج‌ها:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-h3 font-extrabold text-brand-orange leading-tight">{country.startingPrice}</span>
                  <span className="text-caption text-text-muted">/ {country.startingPriceNote || 'هر نفر در اتاق ۲ تخته'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#inquiry-form"
                  className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold shadow-subtle hover:shadow-card transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>ثبت درخواست تماس</span>
                </a>

                <a
                  href="#active-tours"
                  className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-2 font-semibold"
                >
                  <Compass className="w-4 h-4 text-brand-orange" />
                  <span>مشاهده پکیج‌های فعال</span>
                </a>
              </div>
            </div>

            {/* Left Column: Modern Hero Image with Clean Floating Badge */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-border-default/80 shadow-card bg-surface-secondary group">
                <div className="aspect-[4/3] relative">
                  <img
                    src={country.image}
                    alt={`تور ${country.name}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Subtle clean bottom edge protection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Modern Badge (Only Tour Count) */}
                <div className="absolute top-3.5 right-3.5">
                  <div className="backdrop-blur-md bg-brand-navy/85 text-white border border-white/20 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    <span className="text-caption font-bold tracking-wide">{country.activeToursCount} پکیج فعال</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 3. Cities & Destinations Catalog in this Country ---------------- */}
      {cities.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 text-right">
            <div>
              <h2 className="text-h2 text-text-heading font-bold mb-1">
                شهرهای توریستی {country.name}
              </h2>
              <p className="text-body-sm text-text-secondary">
                مقصد مورد نظر خود را برای مشاهده لیست تورها و هتل‌ها انتخاب کنید:
              </p>
            </div>
            <span className="text-caption font-semibold text-text-muted bg-surface-secondary px-3 py-1.5 rounded-full border border-border-default self-start sm:self-auto">
              {cities.length} مقصد فعال
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {cities.map((city) => (
              <div
                key={city.id}
                onClick={() => onNavigate(`/destination/${country.slug}/${city.slug}`)}
                className="card-destination h-[210px] sm:h-[240px] md:h-[260px] w-full rounded-xl overflow-hidden shadow-card hover:shadow-floating hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                {/* Background Image */}
                <img
                  src={city.image}
                  alt={`تور ${city.name}`}
                  className="card-destination-image"
                />

                {/* Dark Gradient Overlay */}
                <div className="card-destination-overlay" />

                {/* Card Content Over Image */}
                <div className="card-destination-content p-3.5 sm:p-4 flex flex-col justify-end">
                  <h3 className="text-body sm:text-h4 font-extrabold text-white truncate mb-0.5 group-hover:text-brand-orange transition-colors">
                    تور {city.name}
                  </h3>
                  <div className="text-[11px] sm:text-caption text-white/70 font-medium mb-2.5 sm:mb-3">
                    {city.nameEn}
                  </div>

                  <div className="pt-2 sm:pt-2.5 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] sm:text-caption text-white/70 leading-none mb-0.5">شروع از</div>
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className="text-body-sm sm:text-body-lg font-extrabold text-white leading-tight">
                          {city.startingPrice.replace(' تومان', '')}
                        </span>
                        <span className="text-[10px] sm:text-caption text-white/70 font-normal">تومان</span>
                      </div>
                    </div>

                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 group-hover:bg-brand-orange text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- 4. Active Tours List ---------------- */}
      <section id="active-tours" className="bg-surface-primary border-y border-border-default py-12 scroll-mt-24">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 mb-6 text-right">
            <Compass className="w-5 h-5 text-brand-orange" />
            <h2 className="text-h2 text-text-heading font-bold">
              لیست تورهای {country.name}
            </h2>
          </div>

          {/* Tour Items List */}
          {tours.length > 0 ? (
            <div className="space-y-4">
              {tours.map((tour) => (
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
            <div className="bg-surface-secondary border border-border-default rounded-card p-8 text-center max-w-xl mx-auto">
              <Info className="w-10 h-10 text-brand-orange mx-auto mb-3" />
              <p className="text-body font-bold text-text-heading mb-1.5">
                در حال حاضر پکیج فعالی در سیستم ثبت نشده است
              </p>
              <p className="text-body-sm text-text-secondary mb-5">
                برای استعلام ظرفیت، پروازهای اختصاصی یا تاریخ‌های دلخواه با کارشناسان ما هماهنگ کنید.
              </p>
              <a 
                href="#inquiry-form" 
                className="btn btn-medium btn-primary text-caption inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>ثبت درخواست تماس</span>
              </a>
            </div>
          )}


        </div>
      </section>

      {/* ---------------- 5. Interactive Collapsible FAQs Accordion ---------------- */}
      {country.faqs && country.faqs.length > 0 && (
        <section className="bg-surface-primary border-t border-border-default py-12">
          <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-caption font-bold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>پاسخ به سوالات مسافران</span>
              </div>
              <h3 className="text-h2 text-text-heading font-extrabold mb-2">
                پرسش‌های متداول تور {country.name}
              </h3>
              <p className="text-body-sm text-text-secondary">
                پاسخ کارشناسان تور به پرتکرارترین سوالات پیش از ثبت نام و رزرو:
              </p>
            </div>

            <div className="space-y-3 text-right">
              {country.faqs.map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="border border-border-default rounded-card overflow-hidden bg-surface-secondary/40 transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 md:p-5 flex items-center justify-between text-right gap-4 hover:bg-surface-secondary transition-colors"
                    >
                      <span className="text-body font-bold text-text-heading flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-caption font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span>{faq.question}</span>
                      </span>
                      <span className="text-text-muted shrink-0">
                        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-orange" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-4 md:p-5 pt-0 text-body-sm text-text-secondary leading-relaxed border-t border-border-default/40 bg-surface-primary">
                        <div className="pr-8 pt-2">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ---------------- 6. Quick Inquiry / Booking Form Section ---------------- */}
      <section id="inquiry-form" className="bg-surface-secondary border-t border-border-default py-12 scroll-mt-24">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 shadow-card text-right">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-control bg-brand-orange text-white flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-h3 font-bold text-text-heading">ثبت درخواست تماس برای تور {country.name}</h3>
            </div>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-card text-center my-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-h4 font-bold text-emerald-800 mb-1">درخواست شما با موفقیت ثبت شد</h4>
                <p className="text-body-sm text-emerald-700">
                  کارشناس تور {country.name} به زودی با شماره {inquiryPhone} تماس خواهد گرفت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-form-label text-text-heading block mb-1 font-semibold">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: علی رضایی"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-control border border-border-default bg-surface-secondary text-body-sm text-text-primary focus:outline-none focus:border-brand-orange focus:bg-surface-primary transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-form-label text-text-heading block mb-1 font-semibold">
                      شماره موبایل
                    </label>
                    <input
                      type="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 rounded-control border border-border-default bg-surface-secondary text-body-sm text-text-primary focus:outline-none focus:border-brand-orange focus:bg-surface-primary transition-colors text-right"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-medium btn-primary text-btn w-full font-bold shadow-card flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>در حال ارسال...</span>
                    ) : (
                      <>
                        <span>ثبت درخواست</span>
                        <ChevronLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </section>

      {/* ---------------- 7. Bottom Banner ---------------- */}
      <section className="bg-brand-navy text-white py-10 border-t border-brand-navy">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-caption font-semibold text-brand-orange bg-white/10 px-3 py-1 rounded-full mb-2">
            مشاوره و پشتیبانی تورهای {country.name}
          </span>
          <h3 className="text-h2 text-white mb-2 font-extrabold">برنامه‌ریزی سفری بی‌دغدغه با ریوان سفر</h3>
          <p className="text-body text-white/80 mb-6 max-w-lg">
            برای استعلام نرخ پروازها، هتل‌ها و واچر اختصاصی، درخواست تماس ثبت کنید.
          </p>
          <a
            href="tel:02633350139"
            className="btn btn-large btn-primary text-btn inline-flex items-center gap-3 font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <Phone className="w-5 h-5" />
            <span dir="ltr">۰۲۶ - ۳۳۳۵۰۱۳۹</span>
          </a>
        </div>
      </section>

    </div>
  );
}
