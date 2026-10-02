import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import TourCard from './TourCard';
import { useContent } from '@/src/lib/content-context';
import type { TourItem } from '@/src/data/toursData';

interface SummerToursProps {
  onNavigate?: (path: string) => void;
}

/** تعداد کارت‌های ویجت؛ با گرید ۴ستونهٔ طرح هم‌خوان است. */
const MAX_CARDS = 4;

const updatedAtMs = (t: TourItem): number => {
  const ms = Date.parse(t.updatedAt);
  return Number.isFinite(ms) ? ms : 0;
};

export default function SummerTours({ onNavigate }: SummerToursProps) {
  const { tours } = useContent();

  // سلکتور: تازه‌ترین تورهای «منتشرشده» به‌جز نمایشگاهی‌ها.
  // چرا همین؟ در اسکیمای تور هیچ فیلد فصل/تگی نیست و «تاریخ حرکت» هم متن
  // آزاد است؛ پس پارس «تابستان» از روی داده حدسِ شکننده می‌شد. صادقانه‌ترین
  // سلکتورِ بدون-حدس، تازگی انتشار است. نمایشگاهی‌ها هم ویجت خودشان را
  // دارند و این‌جا تکرار نمی‌شوند.
  // گیت انتشار همین‌جا اعمال شده: useContent فقط تورهای «منتشرشده» و
  // بایگانی‌نشده را می‌دهد (فیلتر publish_status در getTours از db-content).
  const summerTours = useMemo(
    () =>
      tours
        .filter((t) => t.type !== 'exhibition')
        .sort((a, b) => updatedAtMs(b) - updatedAtMs(a))
        .slice(0, MAX_CARDS),
    [tours],
  );

  // اگر هیچ تور منتشرشده‌ای نیست، سکشن اصلاً رندر نمی‌شود
  // (به‌جای کارت فیک، سکشن خالی یا لینک ۴۰۴).
  if (summerTours.length === 0) return null;

  return (
    <section className="section-standard bg-surface-primary relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 text-text-heading"
          >
            بهترین تورهای تابستان ۱۴۰۵
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.6, delay: 0.1 }}
             className="text-text-secondary mt-2 text-body-sm max-w-subtitle mx-auto"
          >
            تورهای فعال تابستان را با تاریخ حرکت، هتل و قیمت پایه مقایسه کنید
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
          {summerTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TourCard 
                title={tour.title}
                image={tour.image}
                duration={tour.duration}
                destination={tour.destination}
                hotelStars={tour.hotelStars}
                badge={tour.badge}
                visaRequired={tour.visaRequired}
                transportKind={tour.transportKind}
                tourType={tour.type}
                price={tour.formattedPrice || undefined}
                onClick={() => onNavigate ? onNavigate(`/tour/${tour.id}`) : undefined}
                href={`/tour/${tour.id}`}
              />
            </motion.div>
          ))}
        </div>
        
        {/* View All */}
        <div className="mt-10 sm:mt-12 text-center">
          <a 
            href="#summer-tours"
            className="text-link text-btn"
          >
            <span>مشاهده همهٔ تورهای تابستان</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
