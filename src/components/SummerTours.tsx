import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import TourCard from './TourCard';

interface SummerToursProps {
  onNavigate?: (path: string) => void;
}

const summerTours = [
  {
    id: 'istanbul-sep',
    title: 'تور استانبول',
    duration: '۳ شب و ۴ روز',
    country: 'ترکیه',
    hotelStars: 4,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800&auto=format&fit=crop',
    price: '۲۵,۵۰۰,۰۰۰',
    visaFree: true,
  },
  {
    id: 'paris-rome',
    title: 'تور پاریس و رم',
    duration: '۷ شب و ۸ روز',
    country: 'فرانسه',
    hotelStars: 4,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
    price: '۹۵,۰۰۰,۰۰۰',
    visaFree: false,
    visaRequired: true,
  },
  {
    id: 'kish-island',
    title: 'تور کیش',
    duration: '۳ شب و ۴ روز',
    country: 'ایران',
    hotelStars: 5,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    price: '۸,۹۰۰,۰۰۰',
    visaFree: true,
  },
  {
    id: 'dubai-autumn',
    title: 'تور دبی',
    duration: '۴ شب و ۵ روز',
    country: 'امارات',
    hotelStars: 4,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    price: '۳۲,۰۰۰,۰۰۰',
    visaFree: false,
    visaRequired: true,
  }
];

export default function SummerTours({ onNavigate }: SummerToursProps) {
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
            فرصت تکرارنشدنی سفرهای رویایی با تضمین بهترین قیمت و کیفیت خدمات
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
                country={tour.country}
                hotelStars={tour.hotelStars}
                price={tour.price}
                visaFree={tour.visaFree}
                visaRequired={tour.visaRequired}
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
            <span>مشاهده تمامی تورهای تابستان</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
