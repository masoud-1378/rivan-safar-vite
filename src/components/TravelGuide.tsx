import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { GUIDES } from '../data/guidesData';
import SmartImage from './SmartImage';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';

/** کارت‌های صفحه اصلی فقط از رجیستری راهنماهای واقعی تغذیه می‌شوند (سند ۰۴) */
const guideList = Object.values(GUIDES);
const MAIN_ARTICLE = guideList[0];
const SUB_ARTICLES = guideList.slice(1);

export default function TravelGuide() {
  return (
    <section id="travel-guides" className="section-standard bg-surface-primary relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-right gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-h2 text-text-heading">
              قبل از ثبت درخواست، بهتر تصمیم بگیرید
            </h2>
            <p className="text-body-sm lg:text-[16px] text-text-secondary mt-2 leading-relaxed max-w-2xl">
              راهنماهای تخصصی برای انتخاب مقصد، بررسی هزینه‌ها، شرایط اقامت و آماده‌سازی مدارک پیش از خرید تور
            </p>
          </motion.div>

          {/* Desktop Link to all guides */}
          <motion.a 
            href="#all-guides"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:inline-flex text-link text-btn shrink-0"
          >
            <span>مشاهده همه راهنماهای سفر</span>
            <ArrowLeft className="w-4 h-4 text-brand-orange group-hover:-translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          
          {/* Main Hero Featured Article */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7"
          >
            <a href={`/guide/${MAIN_ARTICLE.slug}`} className="card-article-featured group">
              <div className="relative w-full aspect-[21/9]">
                <SmartImage 
                  src={MAIN_ARTICLE.heroImage || DEFAULT_FALLBACK_IMAGE} 
                  alt={MAIN_ARTICLE.title}
                  className="card-article-featured-image"
                />
              </div>
              <div className="card-article-featured-content">
                <div className="card-article-category">
                  {MAIN_ARTICLE.categoryLabel}
                </div>
                <h3 className="card-article-featured-title">
                  {MAIN_ARTICLE.title}
                </h3>
                <p className="card-article-featured-desc">
                  {MAIN_ARTICLE.summary}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-caption text-text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-text-secondary opacity-70" />
                      {MAIN_ARTICLE.readTime} مطالعه
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 opacity-70">
                      <Calendar className="w-4 h-4" />
                      {MAIN_ARTICLE.lastReviewedAt}
                    </span>
                  </div>
                  <span className="text-link text-body-sm group-hover:text-brand-orange transition-colors">
                    مطالعه راهنما
                  </span>
                </div>
              </div>
            </a>
          </motion.article>

          {/* Sub Articles Stack */}
          <div className="lg:col-span-5 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4 justify-between">
            {SUB_ARTICLES.map((article, idx) => (
              <motion.a 
                href={`/guide/${article.slug}`}
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (idx + 1) * 0.08 }}
                className="card-article-compact"
              >
                <div className="card-article-compact-thumbnail relative">
                  <SmartImage 
                    src={article.heroImage || DEFAULT_FALLBACK_IMAGE} 
                    alt={article.title}
                    sizes="120px"
                  />
                </div>
                <div className="card-article-compact-content">
                  <div className="card-article-category" style={{ marginBottom: '4px', fontSize: '10px' }}>
                    {article.categoryLabel}
                  </div>
                  <h3 className="card-article-compact-title">
                    {article.title}
                  </h3>
                  <div className="card-article-meta mt-1">
                    <span className="inline-flex items-center gap-1 opacity-80">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Mobile Action Button */}
        <div className="mt-8 md:hidden text-center">
          <a 
            href="#all-guides"
            className="text-link text-btn w-full justify-center mt-6"
          >
            <span>مشاهده همه راهنماهای سفر</span>
            <ArrowLeft className="w-4 h-4 text-brand-orange" />
          </a>
        </div>

      </div>
    </section>
  );
}
