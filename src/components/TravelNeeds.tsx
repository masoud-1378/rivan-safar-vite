import React from 'react';
import { motion } from 'motion/react';
import { FileCheck2, Wallet, Gem, Clock, ArrowLeft } from 'lucide-react';

interface TravelNeedItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  isSeasonal?: boolean;
}

const TRAVEL_NEEDS: TravelNeedItem[] = [
  {
    id: 'no-visa',
    title: 'تورهای خارجی بدون ویزا',
    desc: 'تورهایی با فرایند ساده‌تر برای شروع سفر خارجی',
    icon: FileCheck2,
    isSeasonal: false,
  },
  {
    id: 'economic',
    title: 'تورهای ارزان',
    desc: 'تورهایی با هزینه کم و با ارزش خرید بالا',
    icon: Wallet,
    isSeasonal: false,
  },
  {
    id: 'luxury',
    title: 'تورهای لوکس',
    desc: 'اقامت در هتل‌های لوکس و خدمات VIP',
    icon: Gem,
    isSeasonal: false,
  },
  {
    id: 'short',
    title: 'تورهای کوتاه‌مدت',
    desc: 'گزینه‌های مناسب برای تعطیلات چندروزه',
    icon: Clock,
    isSeasonal: false,
  }
];

export default function TravelNeeds() {
  return (
    <section className="section-standard bg-page-background relative overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-h2 text-text-heading mb-2"
          >
            چه نوع سفری برای شما مناسب است؟
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="text-body-lg text-text-secondary max-w-subtitle mx-auto"
          >
            بر اساس بودجه، زمان و سبک سفر خود، گزینه‌های مناسب را انتخاب کنید.
          </motion.p>
        </div>

        {/* Grid - 4 columns on desktop, 2 columns on tablet/mobile, 1 column on tiny mobile */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TRAVEL_NEEDS.map((item, idx) => (
             <motion.a 
               key={item.id}
               href={`#${item.id}`}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.05, duration: 0.4 }}
               className="group relative bg-surface-primary border border-border-default rounded-card p-5 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[190px] h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
             >
               <div>
                 {/* Top Row: Icon Container (Right Aligned in RTL) */}
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-control bg-brand-orange-soft flex items-center justify-center text-brand-orange shrink-0 transition-colors group-hover:bg-brand-orange group-hover:text-white">
                     <item.icon className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={1.75} />
                   </div>
                 </div>
                 
                 {/* Title & Description */}
                 <div className="text-right">
                   <h3 className="text-body-lg font-extrabold text-text-heading group-hover:text-brand-orange transition-colors line-clamp-2 mb-1.5">
                     {item.title}
                   </h3>
                   <p className="text-body-sm text-text-secondary line-clamp-2 leading-relaxed">
                     {item.desc}
                   </p>
                 </div>
               </div>
               
               {/* Bottom Left Arrow (Entry Cue) */}
               <div className="flex items-center justify-start mt-4 pt-2">
                 <div className="w-8 h-8 rounded-full bg-surface-secondary/60 flex items-center justify-center text-text-secondary group-hover:bg-brand-orange-soft group-hover:text-brand-orange transition-all">
                   <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                 </div>
               </div>
             </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

