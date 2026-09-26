import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Star } from 'lucide-react';
import SmartImage from './SmartImage';
import TravelSearchWidget, { TravelSearchState } from './TravelSearchWidget';

interface HeroProps {
  showAnnouncement?: boolean;
  onNavigate?: (path: string) => void;
}

export default function Hero({ showAnnouncement = true, onNavigate }: HeroProps) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleSearchWidget = (searchState: TravelSearchState) => {
    if (!onNavigate) return;
    if (searchState.destination) {
      if (searchState.destination === 'istanbul') onNavigate('/destination/turkey/istanbul');
      else if (searchState.destination === 'antalya') onNavigate('/destination/turkey/antalya');
      else if (searchState.destination === 'dubai') onNavigate('/destination/uae/dubai');
      else if (searchState.destination === 'kish') onNavigate('/destination/iran/kish');
      else if (searchState.destination === 'mashhad') onNavigate('/destination/iran/mashhad');
      else if (searchState.destination === 'phuket') onNavigate('/destination/thailand/phuket');
      else onNavigate('/tours');
    } else if (searchState.tourKind === 'foreign') {
      onNavigate('/tours/foreign');
    } else if (searchState.tourKind === 'domestic') {
      onNavigate('/tours/domestic');
    } else if (searchState.tourKind === 'exhibition') {
      onNavigate('/exhibitions');
    } else {
      onNavigate('/tours');
    }
  };

  return (
    <section className={`relative w-full pb-10 sm:pb-12 lg:pb-10 overflow-hidden bg-page-background transition-[padding-top] duration-500 ease-in-out ${showAnnouncement ? "pt-[140px] md:pt-[140px] lg:pt-[130px]" : "pt-[100px] md:pt-[100px] lg:pt-[100px]"}`}>
      <div className="container-main px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* Text Content - Right (RTL) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-right w-full"
          >
            <h1 className="text-display text-text-heading mb-5 sm:mb-6">
              <span className="block text-brand-orange mb-2">ریوان سفر</span>
              برای اهـل سـفـر
            </h1>
            
            <p className="text-body-lg md:text-xl text-text-secondary max-w-hero mb-8 leading-relaxed">
              تاریخ و قیمت پایه تورها، توضیح مسیر واقعی سفر و بررسی برنامه شخصی با کارشناس
            </p>
            
            {/* VibeFarsi Travel Search Widget */}
            <div className="w-full max-w-[850px] mt-2 mb-6 relative">
              <TravelSearchWidget onSearch={handleSearchWidget} />
            </div>
          </motion.div>

          {/* Visual Content - Left (RTL) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:h-[500px] xl:h-[600px] flex items-center justify-center px-2 sm:px-0 w-full mt-4 lg:mt-0 transition-all duration-300 ease-in-out"
          >
            {/* Main Image Grid Composition */}
            <div className="relative w-full max-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-none grid grid-cols-12 gap-3.5 sm:gap-4 md:gap-6">
              <div className="col-span-7 flex flex-col h-full">
                <div className="relative w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[420px]">
                  <SmartImage 
                    src="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=800&auto=format&fit=crop" 
                    alt="استانبول" 
                    priority
                    className="object-cover rounded-card md:rounded-feature shadow-floating"
                  />
                </div>
              </div>
              <div className="col-span-5 flex flex-col gap-3.5 sm:gap-4 md:gap-6 translate-y-6 sm:translate-y-8">
                <div className="relative w-full h-[90px] sm:h-[140px] md:h-[170px] lg:h-[200px]">
                  <SmartImage 
                    src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" 
                    alt="دبی" 
                    className="object-cover rounded-card md:rounded-feature shadow-card"
                  />
                </div>
                <div className="relative w-full h-[90px] sm:h-[140px] md:h-[170px] lg:h-[200px]">
                  <SmartImage 
                    src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop" 
                    alt="تایلند" 
                    className="object-cover rounded-card md:rounded-feature shadow-card"
                  />
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -start-2 sm:-start-4 md:-start-8 lg:-start-6 xl:-start-12 top-1/4 z-10"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="bg-surface-primary/90 backdrop-blur-md p-2 sm:p-3 rounded-card sm:rounded-feature shadow-floating border border-white/60 hidden sm:flex items-center justify-center gap-2 sm:gap-3 pr-3 sm:pr-4 pl-3 sm:pl-4 select-none"
                >
                  <div className="text-body-sm font-black text-text-heading leading-none">رضایت مسافران</div>
                  <div className="bg-brand-orange-soft w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-control sm:rounded-control text-brand-orange shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -end-2 sm:-end-4 md:-end-8 lg:-end-6 xl:-end-8 bottom-1/4 z-10"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                  className="bg-surface-primary/90 backdrop-blur-md p-1.5 sm:p-2 rounded-card sm:rounded-feature shadow-floating border border-white/60 hidden sm:flex items-center gap-2 sm:gap-4 pl-3 sm:pl-5 select-none"
                >
                  <div className="bg-page-background w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-control sm:rounded-card text-text-heading">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-caption text-text-secondary mb-0.5">تور فعال</div>
                    <div className="text-body-sm sm:text-xl font-black text-text-heading leading-none">+۳۰</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
