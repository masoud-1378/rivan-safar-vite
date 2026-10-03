import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import SmartImage from './SmartImage';
import { useContent } from '@/src/lib/content-context';
import type { Place } from '@/src/data/destinationsData';
import { fa } from '@/lib/utils';

interface WidgetCard {
  id: string;
  title: string;
  image: string;
  price: string;
  badge: string;
  toursCount: number;
  path: string;
}

/**
 * ایراد ۱۹: کارت‌های «تورهای محبوب» از دیتابیس می‌آیند — فقط شهرهای دارای
 * تور فعال، به ترتیب تعداد تور. قیمت و شمار تور هم واقعی‌اند، نه هاردکد.
 * useContent هنگام قطعی DB خودش به دیتای استاتیک برمی‌گردد.
 */
function toCard(c: Place): WidgetCard {
  return {
    id: c.id,
    title: `تور ${c.name}`,
    image: c.image,
    price: (c.startingPrice || '').trim(),
    badge: c.parentCountryName || c.name,
    toursCount: c.activeToursCount,
    path: `/destination/${c.parentCountrySlug || c.slug}/${c.slug}`,
  };
}

interface DestinationsProps {
  onNavigate?: (path: string) => void;
}

export default function Destinations({ onNavigate }: DestinationsProps) {
  const { cities } = useContent();

  // ایراد ۱۹: فقط شهرهای دارای تور فعال، پرتعدادترین‌ها اول.
  const { foreignCards, domesticCards } = useMemo(() => {
    const live = Object.values(cities)
      .filter((c) => c.activeToursCount > 0)
      .sort((a, b) => b.activeToursCount - a.activeToursCount);
    return {
      foreignCards: live.filter((c) => c.category !== 'domestic').slice(0, 8).map(toCard),
      domesticCards: live.filter((c) => c.category === 'domestic').slice(0, 4).map(toCard),
    };
  }, [cities]);

  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <section className="section-standard bg-page-background relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">

        {foreignCards.length > 0 && (
        <>
        {/* Foreign Tours Section Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 text-text-heading"
          >
            تورهای خارجی محبوب
          </motion.h2>
          <motion.a
            href="/tours/foreign"
            onClick={(e) => handleNav('/tours/foreign', e)}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-link text-btn self-start sm:self-auto cursor-pointer"
          >
            <span>مشاهده همه <span className="hidden sm:inline">تورهای خارجی</span></span>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Grid */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {foreignCards.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group w-full"
            >
              {/* Layer 2 (Lowest) */}
              <div className="hidden sm:block absolute -bottom-3 left-6 right-6 h-[90%] bg-border-default/60 rounded-card md:rounded-feature transition-all duration-500 group-hover:translate-y-2 group-hover:opacity-40 z-0" />
              
              {/* Layer 1 (Middle) */}
              <div className="hidden sm:block absolute -bottom-1.5 left-3 right-3 h-[95%] bg-page-background/90 rounded-card md:rounded-feature shadow-subtle transition-all duration-500 group-hover:translate-y-1 group-hover:opacity-70 z-0" />

              {/* Main Card — لینک HTML واقعی به صفحه مقصد */}
              <a
                href={dest.path}
                onClick={(e) => handleNav(dest.path, e)}
                className="card-destination h-[220px] sm:h-auto sm:aspect-[4/5] w-full block"
              >
                <SmartImage 
                  src={dest.image} 
                  alt={dest.title}
                  className="card-destination-image"
                />
                
                <div className="absolute top-4 right-4 z-20">
                  <div className="badge bg-surface-dark/40 backdrop-blur border-white/10 text-white whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{dest.badge}</span>
                  </div>
                </div>

                <div className="card-destination-overlay" />

                <div className="card-destination-content p-4 sm:p-5 flex flex-col justify-end">
                  <h3 className="card-destination-title text-body-lg sm:text-h3 font-extrabold text-white truncate mb-0.5">
                    {dest.title}
                  </h3>
                  <div className="card-destination-subtitle text-body-sm text-white/80 font-normal mb-3">
                    {fa(dest.toursCount)} تور فعال
                  </div>
                  
                  <div className="card-destination-footer pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      {dest.price ? (
                        <>
                          <div className="card-destination-price-label text-caption text-white/70">شروع از</div>
                          <div className="flex items-baseline gap-1 whitespace-nowrap">
                            <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">{dest.price}</span>
                            <span className="card-destination-price-label text-caption text-white/70 font-normal">تومان</span>
                          </div>
                        </>
                      ) : (
                        <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">استعلام قیمت</span>
                      )}
                    </div>
                    <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                      <svg className="w-4 h-4 rotate-180 text-white card-destination-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
        </>
        )}

        {domesticCards.length > 0 && (
        <>
        {/* Domestic Tours Section Header */}
        <div className="mt-16 lg:mt-20 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 text-text-heading"
          >
            تورهای داخلی پرطرفدار
          </motion.h2>
          <motion.a
            href="/tours/domestic"
            onClick={(e) => handleNav('/tours/domestic', e)}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-link text-btn self-start sm:self-auto cursor-pointer"
          >
            <span>مشاهده همه <span className="hidden sm:inline">تورهای داخلی</span></span>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Domestic Grid */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {domesticCards.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group w-full"
            >
              {/* Layer 2 (Lowest) */}
              <div className="hidden sm:block absolute -bottom-3 left-6 right-6 h-[90%] bg-border-default/60 rounded-card md:rounded-feature transition-all duration-500 group-hover:translate-y-2 group-hover:opacity-40 z-0" />
              
              {/* Layer 1 (Middle) */}
              <div className="hidden sm:block absolute -bottom-1.5 left-3 right-3 h-[95%] bg-page-background/90 rounded-card md:rounded-feature shadow-subtle transition-all duration-500 group-hover:translate-y-1 group-hover:opacity-70 z-0" />

              {/* Main Card — لینک HTML واقعی به صفحه مقصد */}
              <a
                href={dest.path}
                onClick={(e) => handleNav(dest.path, e)}
                className="card-destination h-[220px] sm:h-auto sm:aspect-[4/5] w-full block"
              >
                <SmartImage 
                  src={dest.image} 
                  alt={dest.title}
                  className="card-destination-image"
                />
                
                <div className="absolute top-4 right-4 z-20">
                  <div className="badge bg-surface-dark/40 backdrop-blur border-white/10 text-white whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{dest.badge}</span>
                  </div>
                </div>

                <div className="card-destination-overlay" />

                <div className="card-destination-content p-4 sm:p-5 flex flex-col justify-end">
                  <h3 className="card-destination-title text-body-lg sm:text-h3 font-extrabold text-white truncate mb-0.5">
                    {dest.title}
                  </h3>
                  <div className="card-destination-subtitle text-body-sm text-white/80 font-normal mb-3">
                    {fa(dest.toursCount)} تور فعال
                  </div>
                  
                  <div className="card-destination-footer pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      {dest.price ? (
                        <>
                          <div className="card-destination-price-label text-caption text-white/70">شروع از</div>
                          <div className="flex items-baseline gap-1 whitespace-nowrap">
                            <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">{dest.price}</span>
                            <span className="card-destination-price-label text-caption text-white/70 font-normal">تومان</span>
                          </div>
                        </>
                      ) : (
                        <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">استعلام قیمت</span>
                      )}
                    </div>
                    <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                      <svg className="w-4 h-4 rotate-180 text-white card-destination-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
        </>
        )}
      </div>
    </section>
  );
}
