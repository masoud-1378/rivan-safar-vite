import React, { useState } from 'react';
import { 
  Building2, Calendar, MapPin, Globe, Phone, Clock, 
  ChevronLeft, FileText, CheckCircle2, ShieldCheck, ArrowLeft,
  Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { type ExhibitionSeries } from '../data/exhibitionsData';
import { useContent } from '@/src/lib/content-context';
import SmartImage from './SmartImage';

interface ExhibitionsHubPageProps {
  onNavigate: (path: string) => void;
}

export default function ExhibitionsHubPage({ onNavigate }: ExhibitionsHubPageProps) {
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = [
    { id: 'all', label: 'همه صنایع' },
    { id: 'trade-industry', label: 'بازرگانی، صنایع و لوازم خانگی' },
    { id: 'food-beverage', label: 'صنایع غذایی و کشاورزی' },
    { id: 'tech-ai', label: 'فناوری اطلاعات و هوش مصنوعی' },
  ];

  const allExhibitions = Object.values(exhibitions);

  const filteredExhibitions = allExhibitions.filter(ex => {
    return selectedIndustry === 'all' || ex.industrySlug === selectedIndustry;
  });

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-right">
          <div className="max-w-3xl">
            <span className="badge badge-warning mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>دپارتمان سفرهای تجاری و نمایشگاهی</span>
            </span>
            <h1 className="text-h1 text-text-heading font-extrabold mb-3">
              تورهای نمایشگاهی بین‌المللی؛ چین، دبی و اروپا
            </h1>
            <p className="text-body text-text-secondary leading-relaxed mb-6">
              پکیج‌های سفر تخصصی به معتبرترین رویدادهای بازرگانی، صنعتی و فناوری جهان. ریوان سفر با خدمات اخذ ویزای تجاری، اقامت در هتل‌های دارای شاتل نمایشگاهی، ثبت‌نام کارت ورود خریدار و مترجم فارسی/محلی در کنار شماست.
            </p>

            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-2">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`chip ${selectedIndustry === ind.id ? 'chip-active' : 'chip-standard'}`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Upcoming Exhibition Series Cards ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="text-right mb-6">
          <h2 className="text-h2 text-text-heading font-bold mb-1.5">
            رویدادهای تجاری و نمایشگاه‌های پیش‌رو
          </h2>
          <p className="text-body-sm text-text-secondary">
            برای بررسی فازها، زمان‌بندی اخذ ویزا و ثبت درخواست سفر روی هر رویداد کلیک کنید.
          </p>
        </div>

        <div className="space-y-6">
          {filteredExhibitions.map((ex) => (
            <a
              key={ex.id}
              href={`/exhibition/${ex.slug}`}
              onClick={(e) => { e.preventDefault(); onNavigate(`/exhibition/${ex.slug}`); }}
              className="group bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col lg:flex-row text-right"
            >
              {/* Image Column */}
              <div className="lg:w-72 xl:w-80 relative shrink-0 aspect-[16/9] lg:aspect-auto">
                <SmartImage
                  src={ex.image}
                  alt={ex.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-brand-navy/90 text-white px-2.5 py-1 rounded-md text-caption font-bold">
                  {ex.city} ({ex.country})
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="badge badge-standard">{ex.industry}</span>
                    <span className="text-caption text-text-muted font-medium">{ex.upcomingEdition.gregorianDate}</span>
                  </div>

                  <h3 className="text-h3 font-bold text-text-heading mb-2 group-hover:text-brand-orange transition-colors">
                    {ex.title}
                  </h3>

                  <p className="text-body-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
                    {ex.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-caption text-text-secondary mb-4 p-3 bg-surface-secondary rounded-control">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>تاریخ برگزاری: {ex.upcomingEdition.solarDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-4 h-4 text-brand-navy shrink-0" />
                      <span>محل: {ex.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-default/60 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-caption text-text-secondary block">شروع قیمت پکیج تجاری:</span>
                    <span className="text-h4 font-extrabold text-brand-orange">{ex.upcomingEdition.startingPrice}</span>
                  </div>

                  <span className="btn btn-secondary btn-small text-caption font-bold inline-flex items-center gap-1.5">
                    <span>بررسی فازها و خدمات سفر</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ---------------- Specialized Business Services ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-standard">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-h2 text-text-heading font-bold mb-2">خدمات اختصاصی ریوان سفر برای هیئت‌های تجاری</h2>
            <p className="text-body-sm text-text-secondary">
              سفر تجاری با تور تفریحی متفاوت است؛ زمان‌بندی دقیق، نزدیکی هتل به محل رویداد و اخذ بدون نقص ویزا تخصص ماست.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-surface-secondary/70 border border-border-default rounded-card p-6">
              <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-h4 font-bold text-text-heading mb-2">اخذ ویزای تجاری و دعوت‌نامه</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                هماهنگی دعوت‌نامه‌های رسمی نمایشگاهی و اخذ ویزای تجاری گروهی و انفرادی چین، امارات و شنگن.
              </p>
            </div>

            <div className="bg-surface-secondary/70 border border-border-default rounded-card p-6">
              <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-h4 font-bold text-text-heading mb-2">هتل‌های متصل با شاتل اختصاصی</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                اقامت در هتل‌های باکیفیت دارای شاتل مستقیم به مجتمع‌های نمایشگاهی جهت جلوگیری از اتلاف وقت در ترافیک شهری.
              </p>
            </div>

            <div className="bg-surface-secondary/70 border border-border-default rounded-card p-6">
              <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-h4 font-bold text-text-heading mb-2">مترجم و پشتیبانی مذاکرات</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                امکان هماهنگی مترجم مسلط به زبان‌های چینی، انگلیسی و عربی برای جلسات B2B و قراردادهای بازرگانی.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Direct Consultation Banner ---------------- */}
      <section className="bg-brand-navy text-white section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h3 className="text-h3 text-white mb-2 font-bold">برای حضور در نمایشگاه‌های بین‌المللی زمان را از دست ندهید</h3>
          <p className="text-body text-white/80 mb-5 max-w-lg">
            مهلت تشکیل پرونده ویزای چین و کشورهای اروپایی محدود است. جهت دریافت تقویم و زمان‌بندی دقیق با کارشناس تماس بگیرید.
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
