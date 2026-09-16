import React from 'react';
import { Phone, Globe, MapPin, Calendar, Clock, ShieldCheck, ArrowLeft, CheckCircle2, FileText, ChevronLeft, Sparkles, Filter } from 'lucide-react';
import { SAMPLE_TOURS, TourItem } from '../data/toursData';
import { COUNTRIES, CITIES, Place } from '../data/destinationsData';
import TourListItem from './TourListItem';

interface HubPageProps {
  type: 'foreign' | 'domestic';
  onNavigate: (path: string) => void;
}

export default function HubPage({ type, onNavigate }: HubPageProps) {
  const isForeign = type === 'foreign';

  // Filter tours
  const tours = SAMPLE_TOURS.filter(t => t.type === type);

  // Filter destinations
  const destinations = Object.values(CITIES).filter(c => {
    if (isForeign) return c.category !== 'domestic';
    return c.category === 'domestic';
  });

  // Filter countries
  const countries = Object.values(COUNTRIES).filter(c => {
    if (isForeign) return c.category !== 'domestic';
    return c.category === 'domestic';
  });

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-right">
            <span className="badge badge-warning mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>{isForeign ? 'مسیرهای بین‌المللی ریوان سفر' : 'سفرهای سراسر ایران'}</span>
            </span>
            <h1 className="text-h1 text-text-heading mb-3 font-extrabold">
              {isForeign ? 'تورهای خارجی؛ مقاصد آسیایی، اروپایی و همسایه' : 'تورهای داخلی؛ کیش، مشهد، قشم و شهرهای تاریخی'}
            </h1>
            <p className="text-body text-text-secondary leading-relaxed mb-6">
              {isForeign 
                ? 'پکیج‌های تور خارجی را با تفکیک مقاصد بدون ویزا، مقاصد با ویزای الکترونیکی، خطوط پروازی و هتل‌های تاییدشده بررسی کنید. قیمت و ظرفیت نهایی پیش از عقد قرارداد رسمی با کارشناس استعلام می‌شود.'
                : 'برنامه حرکت، هتل‌های نزدیک مراکز زیارتی یا ساحلی و خدمات تورهای داخلی را با قیمت پایه و شرایط روشن بررسی کرده و برای نهایی‌سازی با کارشناس در ارتباط باشید.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:02633350139"
                className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>مشاوره تلفنی با کارشناس</span>
              </a>
              <button
                onClick={() => onNavigate('/tours')}
                className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>مشاهده همه تورها در جدول فیلتر</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Featured Destinations & Countries ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-text-heading font-bold">
            {isForeign ? 'کشورها و مقصدهای فعال خارجی' : 'مقصدهای فعال داخلی'}
          </h2>
          <button
            onClick={() => onNavigate('/destinations')}
            className="text-brand-orange hover:text-brand-orange-hover font-bold text-body-sm inline-flex items-center gap-1"
          >
            <span>مشاهده همه مقصدها</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onNavigate(`/destination/${dest.parentCountrySlug || dest.slug}/${dest.slug}`)}
              className="group bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={dest.image}
                  alt={`تور ${dest.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-brand-navy/90 text-white px-2.5 py-1 rounded-md text-caption font-bold">
                  {dest.parentCountryName || dest.name}
                </div>
                {!dest.visaRequired && (
                  <div className="absolute bottom-3 right-3 bg-emerald-700/90 text-white px-2.5 py-0.5 rounded-md text-caption font-medium">
                    بدون نیاز به ویزا
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-h4 font-bold text-text-heading mb-1.5 group-hover:text-brand-orange transition-colors">
                    تور {dest.name}
                  </h3>
                  <p className="text-body-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {dest.heroTagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-default/60 flex items-center justify-between">
                  <div>
                    <span className="block text-caption text-text-secondary">شروع قیمت پایه:</span>
                    <span className="text-body font-extrabold text-brand-orange">{dest.startingPrice}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption font-bold text-text-heading group-hover:text-brand-orange transition-colors">
                    <span>مشاهده تورها</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Active Tours List ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-standard">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="text-right mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-1.5">
              {isForeign ? 'تورهای فعال خارجی آماده استعلام' : 'تورهای فعال داخلی با تاریخ‌های مشخص'}
            </h2>
            <p className="text-body-sm text-text-secondary">
              تمام قیمت‌ها با مبنای اتاق دوتخته و بر اساس آخرین بررسی با ایرلاین‌ها و هتل‌ها درج شده‌اند.
            </p>
          </div>

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
        </div>
      </section>

      {/* ---------------- Key Decision Factors & Trust Block ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary border border-border-default rounded-card p-6 text-right">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">قیمت شفاف با مبنای روشن</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              شروع قیمت هر تور همراه با نوع اتاق، هتل و خدمات شامل و غیرشامل ذکر شده است تا قبل از تماس مقایسه‌ای شفاف داشته باشید.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6 text-right">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">پاسخ‌گویی سریع کارشناس</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              پس از ثبت درخواست تماس یا تماس تلفنی، کارشناس متخصص همان مقصد اطلاعات دقیق صندلی پرواز و واچر هتل را برای شما بررسی می‌کند.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6 text-right">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">قرارداد رسمی و مجوز دار</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              تمام خدمات و ترانسفرها تحت قرارداد مکتوب و رسمی آژانس مسافرتی ریوان سفر البرز صادر شده و پشتیبانی کامل سفر را به همراه دارد.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- CTA Banner ---------------- */}
      <section className="bg-brand-navy text-white section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h3 className="text-h3 text-white mb-2 font-bold">هنوز تور یا مقصدتان را انتخاب نکردید؟</h3>
          <p className="text-body text-white/80 mb-5 max-w-lg">
            با کارشناسان متخصص ریوان سفر تماس بگیرید تا بر اساس بودجه، تاریخ و سلیقه شما بهترین گزینه‌ها را بررسی کنیم.
          </p>
          <a
            href="tel:02633350139"
            className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2.5 font-bold shadow-card"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">۰۲۶ - ۳۳۳۵۰۱۳۹</span>
          </a>
        </div>
      </section>
    </div>
  );
}
