import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import SmartImage from './SmartImage';

/** نگاشت عنوان کارت به مسیر واقعی مقصد (سند ۰۳: لینک HTML واقعی) */
const DESTINATION_PATHS: Record<string, string> = {
  'تور استانبول': '/destination/turkey/istanbul',
  'تور دبی': '/destination/uae/dubai',
  'تور تایلند': '/destination/thailand',
  'تور ترکیه': '/destination/turkey',
  'تور کیش': '/destination/iran/kish',
  'تور مشهد': '/destination/iran/mashhad',
};

const domesticDestinations = [
  {
    id: 10,
    title: 'تور کیش',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    price: '۴,۵۰۰,۰۰۰',
    badge: 'تفریحات دریایی',
    toursCount: '۴۵',
  },
  {
    id: 11,
    title: 'تور مشهد',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop',
    price: '۳,۲۰۰,۰۰۰',
    badge: 'هتل نزدیک حرم',
    toursCount: '۶۰',
  },
  {
    id: 12,
    title: 'تور قشم',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop',
    price: '۵,۸۰۰,۰۰۰',
    badge: 'گشت جزیره هنگام',
    toursCount: '۲۲',
  },
  {
    id: 15,
    title: 'تور چابهار',
    image: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?q=80&w=800&auto=format&fit=crop',
    price: '۸,۵۰۰,۰۰۰',
    badge: 'گشت کوه‌های مریخی',
    toursCount: '۱۴',
  }
];

const destinations = [
  {
    id: 1,
    title: 'تور استانبول',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800&auto=format&fit=crop',
    price: '۱۴,۵۰۰,۰۰۰',
    badge: 'پرواز ترکیش',
    toursCount: '۱۸',
  },
  {
    id: 2,
    title: 'تور دبی',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    price: '۲۲,۳۰۰,۰۰۰',
    badge: 'ویزا فوری',
    toursCount: '۲۴',
  },
  {
    id: 3,
    title: 'تور تایلند',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop',
    price: '۴۵,۹۰۰,۰۰۰',
    badge: 'ترانسفر اختصاصی',
    toursCount: '۱۲',
  },
  {
    id: 4,
    title: 'تور ارمنستان',
    image: 'https://images.unsplash.com/photo-1559586616-361e18714958?q=80&w=800&auto=format&fit=crop',
    price: '۱۱,۲۰۰,۰۰۰',
    badge: 'گشت شهری رایگان',
    toursCount: '۹',
  },
  {
    id: 5,
    title: 'تور گرجستان',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg',
    price: '۱۲,۸۰۰,۰۰۰',
    badge: 'اقامت با صبحانه',
    toursCount: '۱۵',
  },
  {
    id: 6,
    title: 'تور اسپانیا',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Plaza_Mayor_De_Madrid_%28215862629%29_edited.jpeg',
    price: '۹۸,۰۰۰,۰۰۰',
    badge: 'اخذ ویزای شینگن',
    toursCount: '۵',
  },
  {
    id: 7,
    title: 'تور فرانسه',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
    price: '۱۰۵,۰۰۰,۰۰۰',
    badge: 'راهنمای فارسی زبان',
    toursCount: '۷',
  },
  {
    id: 9,
    title: 'تور ترکیه',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop',
    price: '۱۸,۵۰۰,۰۰۰',
    badge: 'اقامت UALL',
    toursCount: '۳۲',
  }
];

interface DestinationsProps {
  onNavigate?: (path: string) => void;
}

export default function Destinations({ onNavigate }: DestinationsProps) {
  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <section className="section-standard bg-page-background relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">
        
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
          {destinations.map((dest, index) => (
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
                href={DESTINATION_PATHS[dest.title] || '/destinations'}
                onClick={(e) => handleNav(DESTINATION_PATHS[dest.title] || '/destinations', e)}
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
                    {dest.toursCount} تور فعال
                  </div>
                  
                  <div className="card-destination-footer pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <div className="card-destination-price-label text-caption text-white/70">شروع از</div>
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">{dest.price}</span>
                        <span className="card-destination-price-label text-caption text-white/70 font-normal">تومان</span>
                      </div>
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
          {domesticDestinations.map((dest, index) => (
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
                href={DESTINATION_PATHS[dest.title] || '/destinations'}
                onClick={(e) => handleNav(DESTINATION_PATHS[dest.title] || '/destinations', e)}
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
                    {dest.toursCount} تور فعال
                  </div>
                  
                  <div className="card-destination-footer pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <div className="card-destination-price-label text-caption text-white/70">شروع از</div>
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className="card-destination-price-value text-body-lg sm:text-h3 font-extrabold text-white">{dest.price}</span>
                        <span className="card-destination-price-label text-caption text-white/70 font-normal">تومان</span>
                      </div>
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
      </div>
    </section>
  );
}
