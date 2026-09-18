import React, { useState } from 'react';
import { 
  Building2, Calendar, MapPin, Globe, Phone, Clock, 
  ChevronLeft, FileText, CheckCircle2, ShieldCheck, ArrowLeft,
  Sparkles, ExternalLink, Send, Check, HelpCircle
} from 'lucide-react';
import { type ExhibitionSeries } from '../data/exhibitionsData';
import { useContent } from '@/src/lib/content-context';
import SmartImage from './SmartImage';

interface ExhibitionDetailPageProps {
  eventSeriesSlug: string;
  editionSlug?: string;
  onNavigate: (path: string) => void;
}

export default function ExhibitionDetailPage({ eventSeriesSlug, editionSlug, onNavigate }: ExhibitionDetailPageProps) {
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const ex: ExhibitionSeries | undefined = exhibitions[eventSeriesSlug];

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    passengers: '1',
    selectedPhase: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  if (!ex) {
    return (
      <div className="container-main py-16 px-4 text-center dir-rtl">
        <h2 className="text-h3 font-bold mb-4">نمایشگاه مورد نظر یافت نشد</h2>
        <button onClick={() => onNavigate('/exhibitions')} className="btn btn-primary btn-medium">
          مشاهده فهرست نمایشگاه‌ها
        </button>
      </div>
    );
  }

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
            <button onClick={() => onNavigate('/exhibitions')} className="hover:text-brand-orange transition-colors">
              تورهای نمایشگاهی
            </button>
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold truncate max-w-[200px] sm:max-w-none">{ex.title}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 text-right">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-standard">{ex.industry}</span>
                <span className="badge">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{ex.city} ({ex.country})</span>
                </span>
                <a
                  href={ex.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption text-brand-orange hover:underline inline-flex items-center gap-1 font-bold mr-2"
                >
                  <span>سایت رسمی نمایشگاه</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h1 className="text-h1 text-text-heading font-extrabold mb-3 leading-tight">
                {ex.title}
              </h1>
              <p className="text-body-sm font-medium text-text-muted mb-2 font-mono" dir="ltr">
                {ex.titleEn}
              </p>

              <p className="text-body text-text-secondary leading-relaxed mb-6">
                {ex.description}
              </p>

              {/* Event Timing & Venue Box */}
              <div className="p-4 bg-surface-secondary rounded-card border border-border-default mb-6 text-caption space-y-2.5">
                <div className="flex items-center gap-2 font-medium text-text-heading">
                  <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>تاریخ دوره پیش‌رو: <strong>{ex.upcomingEdition.solarDate}</strong> ({ex.upcomingEdition.gregorianDate})</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Building2 className="w-4 h-4 text-brand-navy shrink-0" />
                  <span>محل برگزاری: {ex.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600 font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>مهلت اقدام برای ویزا: {ex.upcomingEdition.visaDeadline}</span>
                </div>
              </div>

              {/* Price & Booking Call */}
              <div className="p-5 bg-surface-secondary/80 rounded-card border border-border-default mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                  <div>
                    <span className="text-caption text-text-secondary block mb-1">شروع قیمت پکیج تجاری:</span>
                    <span className="text-h2 font-extrabold text-brand-orange">{ex.upcomingEdition.startingPrice}</span>
                  </div>
                  <a
                    href="tel:02633350139"
                    className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold shadow-subtle"
                  >
                    <Phone className="w-4 h-4" />
                    <span>مشاوره پکیج نمایشگاهی</span>
                  </a>
                </div>
                <p className="text-caption text-text-secondary border-t border-border-default/40 pt-2">
                  مبنا: {ex.upcomingEdition.startingPriceNote}
                </p>
              </div>

            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-card overflow-hidden border border-border-default shadow-card relative">
                <SmartImage
                  src={ex.image}
                  alt={ex.title}
                  priority
                  className="object-cover"
                />
              </div>

              <div className="mt-4 p-4 bg-surface-primary rounded-card border border-border-default text-right text-caption text-text-secondary space-y-2">
                <div className="flex items-center gap-2 font-bold text-text-heading">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>پشتیبانی کامل ویزا و اقامت</span>
                </div>
                <p className="leading-relaxed">
                  کارشناسان ریوان سفر پرونده ویزا، اقامت و ترانسفر شما را بر اساس چک‌لیست پیگیری می‌کنند؛ نتیجه صدور در اختیار مرجع صادرکننده است.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- Phases Breakdown ---------------- */}
      {ex.upcomingEdition.phases && ex.upcomingEdition.phases.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="text-right mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-1.5">
              فازها و دسته‌بندی کالایی نمایشگاه
            </h2>
            <p className="text-body-sm text-text-secondary">
              کالای تخصصی خود را پیدا کنید و فاز مناسب را برای حضور انتخاب نمایید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ex.upcomingEdition.phases.map((phase, idx) => (
              <div key={idx} className="bg-surface-primary border border-border-default rounded-card p-6 text-right flex flex-col justify-between">
                <div>
                  <div className="inline-flex px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange font-bold text-caption mb-3">
                    {phase.name}
                  </div>
                  <h3 className="text-h4 font-bold text-text-heading mb-3">{phase.date}</h3>
                  <ul className="space-y-2 text-body-sm text-text-secondary mb-6">
                    {phase.categories.map((cat, cIdx) => (
                      <li key={cIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#trade-form"
                  className="btn btn-secondary btn-small w-full text-caption font-bold text-center"
                >
                  استعلام پکیج این فاز
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Included Travel Services ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-standard">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-right mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-2">
              خدمات پکیج سفر تجاری ریوان سفر
            </h2>
            <p className="text-body-sm text-text-secondary">
              تمامی خدمات زیر در پکیج ثبت‌نام شما گنجانده شده و به صورت مکتوب در قرارداد قید می‌گردد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ex.servicesIncluded.map((srv, idx) => (
              <div key={idx} className="p-4 bg-surface-secondary rounded-card border border-border-default/60 flex items-center gap-3 text-right">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-body-sm font-medium text-text-primary">{srv}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Business Preparation Tips ---------------- */}
      {ex.businessTips && ex.businessTips.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 text-right">
            <h3 className="text-h3 font-bold text-text-heading mb-4">نکات مهم برای موفقیت در این سفر تجاری</h3>
            <div className="space-y-3">
              {ex.businessTips.map((tip, idx) => (
                <div key={idx} className="p-3.5 bg-surface-secondary rounded-control text-body-sm text-text-secondary leading-relaxed flex items-start gap-2.5">
                  <span className="font-bold text-brand-orange shrink-0">💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Trade Callback Form ---------------- */}
      <section id="trade-form" className="bg-surface-primary border-t border-border-default section-standard scroll-mt-12">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-6">
            <span className="badge badge-warning mb-2">مشاوره تخصصی بازرگانی</span>
            <h3 className="text-h2 text-text-heading font-bold mb-2">درخواست مشاوره سفر به {ex.title}</h3>
            <p className="text-body-sm text-text-secondary">
              جهت هماهنگی ویزا، دریافت برنامه دقیق پرواز و اقامت در هتل‌های نزدیک نمایشگاه فرم زیر را تکمیل نمایید.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center text-emerald-900">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-h4 font-bold mb-2">درخواست شما ثبت گردید</h4>
              <p className="text-body-sm text-emerald-800 mb-4">
                کارشناس دپارتمان نمایشگاهی ریوان سفر جهت ارائه شرایط و مدارک ویزا به زودی با شما تماس خواهد گرفت.
              </p>
              <div className="text-caption text-emerald-700">
                تماس مستقیم با بخش نمایشگاهی: <a href="tel:02633350139" className="font-bold underline">۰۲۶۳۳۳۵۰۱۳۹</a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-surface-secondary border border-border-default rounded-card p-6 text-right space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">نام شرکت / کسب‌وکار (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مثال: بازرگانی البرز"
                    className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">نام و نام خانوادگی مسئول <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: مهندس راد"
                    className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">شماره تلفن همراه <span className="text-red-500">*</span></label>
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

                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">تعداد نفرات هیئت</label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="w-full bg-surface-primary border border-border-default rounded-control px-3 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  >
                    <option value="1">۱ نفر</option>
                    <option value="2">۲ نفر</option>
                    <option value="3">۳ نفر</option>
                    <option value="4+">۴ نفر به بالا (هیئت شرکتی)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">توضیحات و حوزه فعالیت (اختیاری)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="حوزه کاری، فاز مد نظر، درخواست مترجم..."
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-medium btn-primary w-full text-btn font-bold inline-flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Send className="w-4 h-4" />
                  <span>{formLoading ? 'در حال ارسال درخواست...' : `درخواست استعلام پکیج ${ex.title}`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
