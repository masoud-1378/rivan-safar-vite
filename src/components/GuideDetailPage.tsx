import React from 'react';
import { 
  BookOpen, Calendar, Clock, ChevronLeft, ArrowRight, 
  CheckCircle2, AlertCircle, ShieldCheck, Phone, MapPin, 
  Building2, Sparkles, Share2
} from 'lucide-react';
import { type GuideItem } from '../data/guidesData';
import { useContent } from '@/src/lib/content-context';
import { useContact } from '@/src/lib/contact-context';
import SmartImage from './SmartImage';

interface GuideDetailPageProps {
  guideSlug: string;
  onNavigate: (path: string) => void;
}

export default function GuideDetailPage({ guideSlug, onNavigate }: GuideDetailPageProps) {
  const contact = useContact();
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const guide: GuideItem | undefined = guides[guideSlug];

  if (!guide) {
    return (
      <div className="container-main py-16 px-4 text-center dir-rtl">
        <h2 className="text-h3 font-bold mb-4">راهنمای مورد نظر یافت نشد</h2>
        <button onClick={() => onNavigate('/guides')} className="btn btn-primary btn-medium">
          بازگشت به فهرست راهنماها
        </button>
      </div>
    );
  }

  // Related guides (same category first, then others)
  const relatedGuides = [
    ...Object.values(guides).filter(
      (g) => g.slug !== guide.slug && g.category === guide.category,
    ),
    ...Object.values(guides).filter(
      (g) => g.slug !== guide.slug && g.category !== guide.category,
    ),
  ].slice(0, 2);

  // Money Page link: هر راهنما به یک صفحه فروش مرتبط وصل است (سند 03)
  // relatedDestinationSlug ممکن است شهر (istanbul) یا کشور (turkey) باشد
  const moneyPagePath = (() => {
    if (guide.relatedTourId) {
      const tour = tours.find((t) => t.id === guide.relatedTourId);
      if (tour) return { path: `/tour/${tour.id}`, label: tour.title };
    }
    if (guide.relatedDestinationSlug) {
      const slug = guide.relatedDestinationSlug;
      const cityEntry = Object.entries(cities ?? {}).find(([, c]) => c.slug === slug);
      if (cityEntry) {
        const [, city] = cityEntry;
        const countrySlug = city.parentCountrySlug ?? slug;
        return {
          path: `/destination/${countrySlug}/${city.slug}`,
          label: `مشاهده تورهای ${city.name}`,
        };
      }
      return { path: `/destination/${slug}`, label: 'مشاهده تورهای مرتبط' };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
          <nav className="flex items-center gap-2 text-caption text-text-secondary font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-brand-orange transition-colors">
              صفحه اصلی
            </button>
            <span className="text-text-muted">/</span>
            <button onClick={() => onNavigate('/guides')} className="hover:text-brand-orange transition-colors">
              راهنمای سفر
            </button>
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold truncate max-w-[200px] sm:max-w-none">{guide.title}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Article Header ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-standard">{guide.categoryLabel}</span>
            <span className="flex items-center gap-1 text-caption text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>زمان مطالعه: {guide.readTime}</span>
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-caption text-text-muted">{guide.lastReviewedAt}</span>
          </div>

          <h1 className="text-h1 text-text-heading font-extrabold mb-4 leading-tight">
            {guide.title}
          </h1>

          <p className="text-body font-medium text-text-secondary leading-relaxed mb-6">
            {guide.summary}
          </p>

          {/* Key Takeaway Box */}
          <div className="p-5 bg-surface-secondary border border-brand-orange/30 rounded-card text-right">
            <div className="flex items-center gap-2 font-bold text-text-heading mb-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>خلاصه و نتیجه‌گیری سریع برای مسافر</span>
            </div>
            <p className="text-body-sm text-text-primary leading-relaxed">
              {guide.directAnswer}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Main Content & Sidebar ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard">
        <div className="space-y-8 text-right">
          {/* Featured Image */}
          <div className="aspect-[21/9] rounded-card overflow-hidden border border-border-default shadow-card relative">
            <SmartImage src={guide.heroImage} alt={guide.title} priority className="object-cover" />
          </div>

          {/* Article Sections */}
          <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 space-y-8">
            {guide.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-h3 font-bold text-text-heading border-r-4 border-brand-orange pr-3">
                  {sec.heading}
                </h2>
                <p className="text-body text-text-secondary leading-relaxed">
                  {sec.content}
                </p>

                {sec.checkpoints && sec.checkpoints.length > 0 && (
                  <ul className="space-y-2 pt-2 pr-2">
                    {sec.checkpoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-body-sm text-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Money Page CTA: قدم بعدی تجاری */}
          {moneyPagePath && (
            <div className="p-6 bg-brand-navy text-white rounded-card flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-h4 font-bold mb-1">آماده بررسی گزینه‌ها هستید؟</h3>
                <p className="text-body-sm text-white/80">تورهای فعال مرتبط با این راهنما را با قیمت پایه ببینید.</p>
              </div>
              <button
                onClick={() => onNavigate(moneyPagePath.path)}
                className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold shrink-0"
              >
                <span>{moneyPagePath.label}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Consultation CTA Inside Article */}
          <div className="p-6 bg-surface-primary border border-border-default rounded-card text-right flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-h4 font-bold text-text-heading mb-1">سؤالی درباره این موضوع دارید؟</h3>
              <p className="text-body-sm text-text-secondary">کارشناسان ریوان سفر در ساعات کاری پاسخگوی شما هستند.</p>
            </div>
            <a
              href={contact.phoneHref}
              className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>تماس با کارشناس</span>
            </a>
          </div>

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div className="pt-6 border-t border-border-default">
              <h3 className="text-h3 font-bold text-text-heading mb-4">راهنماهای مرتبط پیشنهادی</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedGuides.map((rg) => (
                  <a
                    key={rg.id}
                    href={`/guide/${rg.slug}`}
                    onClick={(e) => { e.preventDefault(); onNavigate(`/guide/${rg.slug}`); }}
                    className="p-4 bg-surface-primary border border-border-default rounded-card hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer text-right flex items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-control overflow-hidden shrink-0 relative">
                      <SmartImage src={rg.heroImage} alt={rg.title} className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <h4 className="text-body-sm font-bold text-text-heading line-clamp-1">{rg.title}</h4>
                      <span className="text-caption text-brand-orange font-medium inline-flex items-center gap-1 mt-1">
                        <span>مطالعه</span>
                        <ChevronLeft className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
