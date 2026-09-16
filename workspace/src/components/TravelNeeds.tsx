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
    desc: 'اقامت در هتل لوکس با خدمات VIP',
    icon: Gem,
    isSeasonal: false,
  },
  {
    id: 'short',
    title: 'تورهای کوتاه‌مدت',
    desc: 'تورهای مناسب برای تعطیلات کوتاه مدت',
    icon: Clock,
    isSeasonal: false,
  }
];

export default function TravelNeeds() {
  return (
    <section className="py-[48px] md:py-[60px] lg:py-[84px] bg-brand-ivory relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-10 text-right">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-[23px] sm:text-[25px] lg:text-[36px] font-bold text-brand-navy leading-[1.4] mb-2 sm:mb-2.5"
          >
            چه نوع سفری برای تو مناسب است؟
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="text-[13px] sm:text-[14px] lg:text-[16px] text-brand-gray"
          >
            براساس بودجه، زمان و سبک سفرت، گزینه‌های مناسب را پیدا کن.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          {TRAVEL_NEEDS.map((item, idx) => (
             <motion.a
               key={item.id}
               href={`#${item.id}`}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.05, duration: 0.4 }}
               className={`group block min-h-[104px] md:min-h-[128px] lg:min-h-[136px] p-[14px] md:p-[18px] lg:p-[24px] rounded-[14px] md:rounded-[16px] lg:rounded-[18px] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${
                 item.isSeasonal 
                   ? 'bg-gradient-to-br from-white to-brand-orange-50 border-brand-orange-300/40 hover:border-brand-orange/40' 
                   : 'bg-white border-brand-border hover:border-brand-orange/30'
               }`}
             >
               <div className="flex flex-col md:flex-row md:items-center h-full">
                 
                 {/* Mobile top row: Icon + Arrow */}
                 <div className="flex items-center justify-between w-full md:w-auto md:mb-0">
                   {/* Icon Box */}
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[14px] bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/15 transition-colors shrink-0 md:ml-4 lg:ml-5">
                     <item.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-orange" strokeWidth={1.75} />
                   </div>
                   {/* Mobile Arrow */}
                   <ArrowLeft className="w-4 h-4 text-brand-gray/40 group-hover:text-brand-orange group-hover:-translate-x-1 transition-all md:hidden" />
                 </div>

                 {/* Content */}
                 <div className="flex flex-col flex-1 mt-3 md:mt-0 text-right">
                   <div className="flex items-center gap-2">
                     <h3 className="text-[14px] sm:text-[15px] lg:text-[17px] font-semibold text-brand-navy group-hover:text-brand-orange transition-colors">
                       {item.title}
                     </h3>
                     {item.isSeasonal && (
                       <span className="hidden lg:inline-flex px-1.5 py-0.5 rounded text-[10px] bg-brand-orange/10 text-brand-orange font-medium border border-brand-orange/20">
                         پیشنهاد فصل
                       </span>
                     )}
                   </div>
                   {/* Description (Hidden on mobile) */}
                   <p className="hidden md:block text-[13px] lg:text-[14px] text-brand-gray leading-[1.7] mt-1 lg:mt-1.5">
                     {item.desc}
                   </p>
                 </div>

                 {/* Desktop/Tablet Arrow */}
                 <ArrowLeft className="hidden md:block w-4 h-4 lg:w-5 lg:h-5 text-brand-gray/40 group-hover:text-brand-orange group-hover:-translate-x-1 transition-all shrink-0 mr-2 lg:mr-4" />

               </div>
             </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
