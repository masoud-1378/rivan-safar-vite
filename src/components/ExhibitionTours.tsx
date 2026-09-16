import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import TourCard from './TourCard';

interface ExhibitionToursProps {
  onNavigate?: (path: string) => void;
}

const exhibitionTours = [
  {
    id: 'japan-tech',
    title: 'تور نمایشگاهی ژاپن',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    price: '۲۵۰,۰۰۰,۰۰۰',
    duration: '۷ شب و ۸ روز',
    country: 'ژاپن',
    hotelStars: 5,
    badge: 'نمایشگاه تکنولوژی',
    visaRequired: true,
  },
  {
    id: 'istanbul-sep',
    title: 'تور نمایشگاهی استانبول',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800&auto=format&fit=crop',
    price: '۳۵,۰۰۰,۰۰۰',
    duration: '۳ شب و ۴ روز',
    country: 'ترکیه',
    hotelStars: 4,
    badge: 'نمایشگاه صنعت',
    visaRequired: false,
  },
  {
    id: 'germany-med',
    title: 'تور نمایشگاهی آلمان',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800&auto=format&fit=crop',
    price: '۱۲۰,۰۰۰,۰۰۰',
    duration: '۵ شب و ۶ روز',
    country: 'آلمان',
    hotelStars: 4,
    badge: 'نمایشگاه پزشکی',
    visaRequired: true,
  },
  {
    id: 'canton-fair',
    title: 'تور نمایشگاهی کنتون فیر',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop',
    price: '۱۸۰,۰۰۰,۰۰۰',
    duration: '۶ شب و ۷ روز',
    country: 'چین',
    hotelStars: 5,
    badge: 'کنتون فیر چین',
    visaRequired: true,
  }
];

export default function ExhibitionTours({ onNavigate }: ExhibitionToursProps) {
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
                country={tour.country}
                hotelStars={tour.hotelStars}
                badge={tour.badge}
                visaRequired={tour.visaRequired}
                price={tour.price}
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
