import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Clock, ChevronLeft, Search, 
  FileText, ShieldCheck, Phone, Sparkles 
} from 'lucide-react';
import { GUIDES, GuideItem } from '../data/guidesData';

interface GuidesHubPageProps {
  onNavigate: (path: string) => void;
}

export default function GuidesHubPage({ onNavigate }: GuidesHubPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: 'همه راهنماها' },
    { id: 'visa', label: 'مدارک و ویزا' },
    { id: 'budget', label: 'مدیریت بودجه و خرید هوشمند' },
    { id: 'comparison', label: 'مقایسه پکیج و هتل' },
  ];

  const allGuides = Object.values(GUIDES);

  const filteredGuides = allGuides.filter((guide) => {
    const matchCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchSearch = guide.title.includes(searchTerm) || guide.summary.includes(searchTerm);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Hero & Search ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-right">
          <div className="max-w-3xl">
            <span className="badge badge-standard mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>مرکز دانش و راهنمای سفر</span>
            </span>
            <h1 className="text-h1 text-text-heading font-extrabold mb-3">
              راهنماهای تخصصی انتخاب تور، مدارک و برنامه‌ریزی سفر
            </h1>
            <p className="text-body text-text-secondary leading-relaxed mb-6">
              مجموعه مقالات کاربردی ریوان سفر برای پاسخ به سؤالات مسافران؛ از بررسی مدارک و مراحل اخذ ویزا تا راهکارهای صرفه‌جویی در هزینه تور و مقایسه پرواز و پکیج.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mb-4">
              <Search className="w-5 h-5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در موضوعات راهنمای سفر..."
                className="w-full bg-surface-secondary border border-border-default rounded-control pr-11 pl-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`chip ${selectedCategory === cat.id ? 'chip-active' : 'chip-standard'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Guides Grid ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        {filteredGuides.length === 0 ? (
          <div className="bg-surface-primary border border-border-default rounded-card p-10 text-center max-w-lg mx-auto">
            <p className="text-h4 font-bold text-text-heading mb-2">راهنمایی با این عبارت یافت نشد</p>
            <p className="text-body-sm text-text-secondary mb-4">لطفاً عبارت دیگری را جستجو نمایید.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-medium btn-secondary"
            >
              پاک کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onNavigate(`/guide/${guide.slug}`)}
                className="group bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between text-right"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={guide.heroImage}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-brand-navy/90 text-white px-2.5 py-1 rounded-md text-caption font-bold">
                      {guide.categoryLabel}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 text-caption text-text-muted mb-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>زمان مطالعه: {guide.readTime}</span>
                      </span>
                      <span>•</span>
                      <span>{guide.lastReviewedAt}</span>
                    </div>

                    <h3 className="text-h4 font-bold text-text-heading mb-2 group-hover:text-brand-orange transition-colors leading-snug">
                      {guide.title}
                    </h3>

                    <p className="text-body-sm text-text-secondary line-clamp-3 leading-relaxed mb-4">
                      {guide.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-border-default/60 flex items-center justify-between">
                  <span className="text-caption font-bold text-brand-orange group-hover:underline inline-flex items-center gap-1">
                    <span>مطالعه متن کامل راهنما</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Need Personal Advice Banner ---------------- */}
      <section className="bg-surface-primary border-t border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h3 className="text-h3 text-text-heading font-bold mb-2">سؤال خاصی درباره مدارک یا تور دارید؟</h3>
          <p className="text-body text-text-secondary max-w-lg mb-5">
            کارشناسان ریوان سفر آماده پاسخ‌گویی به سؤالات اختصاصی شما در زمینه ویزا، پروازها و انتخاب هتل هستند.
          </p>
          <a
            href="tel:02633350139"
            className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2.5 font-bold shadow-subtle"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">۰۲۶ - ۳۳۳۵۰۱۳۹</span>
          </a>
        </div>
      </section>
    </div>
  );
}
