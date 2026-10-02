import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import TourCard from './TourCard';
import { useContent } from '@/src/lib/content-context';
import type { TourItem } from '@/src/data/toursData';

interface ExhibitionToursProps {
  onNavigate?: (path: string) => void;
}

/** تعداد کارت‌های ویجت؛ با گرید ۴ستونهٔ طرح هم‌خوان است. */
const MAX_CARDS = 4;

const updatedAtMs = (t: TourItem): number => {
  const ms = Date.parse(t.updatedAt);
  return Number.isFinite(ms) ? ms : 0;
};

export default function ExhibitionTours({ onNavigate }: ExhibitionToursProps) {
  const { tours } = useContent();

  // سلکتور محصولی: تورهایی که ادمین در پنل نوعشان را «نمایشگاهی» ثبت کرده.
  // گیت انتشار همین‌جا اعمال شده: useContent فقط تورهای «منتشرشده» و
  // بایگانی‌نشده را می‌دهد (فیلتر publish_status در getTours از db-content).
  const exhibitionTours = useMemo(
    () =>
      tours
        .filter((t) => t.type === 'exhibition')
        .sort((a, b) => updatedAtMs(b) - updatedAtMs(a))
        .slice(0, MAX_CARDS),
    [tours],
  );

  // اگر هیچ تور نمایشگاهیِ منتشرشده‌ای نیست، سکشن اصلاً رندر نمی‌شود
  // (به‌جای کارت فیک، سکشن خالی یا لینک ۴۰۴).
  if (exhibitionTours.length === 0) return null;

  return (
    <section className="section-standard bg-surface-primary relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 text-text-heading flex items-center gap-3"
          >
            تورهای نمایشگاهی
          </motion.h2>
          <motion.a
            href="#exhibition-tours"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-link text-btn"
          >
            <span>مشاهده همه <span className="hidden sm:inline">تورهای نمایشگاهی</span></span>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
          {exhibitionTours.map((tour, index) => (
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
      </div>
    </section>
  );
}
