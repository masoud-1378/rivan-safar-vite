import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Search, Loader2 } from 'lucide-react';

const DESTINATIONS = [
  { name: 'استانبول', popular: true },
  { name: 'آنتالیا', popular: true },
  { name: 'دبی', popular: true },
  { name: 'کیش', popular: true },
  { name: 'مشهد', popular: true },
  { name: 'پوکت', popular: true },
  { name: 'بالی', popular: true },
  { name: 'قشم', popular: false },
  { name: 'شیراز', popular: false },
  { name: 'اصفهان', popular: false },
  { name: 'تبریز', popular: false },
  { name: 'یزد', popular: false },
  { name: 'تهران', popular: false },
  { name: 'وان', popular: false },
  { name: 'پاتایا', popular: false },
  { name: 'پاریس', popular: false },
  { name: 'رم', popular: false },
  { name: 'بارسلونا', popular: false },
  { name: 'پکن', popular: false },
  { name: 'گوانگجو', popular: false },
  { name: 'کانتون', popular: false },
  { name: 'مسکو', popular: false },
  { name: 'سن پترزبورگ', popular: false },
];

const normalizePersian = (text: string) => {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[يآأإٱ]/g, (m) => (m === 'ي' ? 'ی' : 'ا'))
    .replace(/ك/g, 'ک')
    .replace(/‌/g, '')
    .replace(/\s+/g, ' ');
};

interface HeroProps {
  showAnnouncement?: boolean;
  onNavigate?: (path: string) => void;
}

export default function Hero({ showAnnouncement = true, onNavigate }: HeroProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const normQuery = normalizePersian(searchQuery);
    if (!normQuery) {
      return [];
    }

    // Filter strictly by destination name match
    const matches = DESTINATIONS.filter(d => {
      const normName = normalizePersian(d.name);
      return normName.includes(normQuery);
    });

    // Sort by relevance (exact > starts-with > alphabetical)
    matches.sort((a, b) => {
      const normA = normalizePersian(a.name);
      const normB = normalizePersian(b.name);

      const aExact = normA === normQuery;
      const bExact = normB === normQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = normA.startsWith(normQuery);
      const bStarts = normB.startsWith(normQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return normA.localeCompare(normB, 'fa');
    });

    return matches.slice(0, 3);
  }, [searchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsFocused(true);
  };

  const getDestinationPath = (tour: string): string => {
    const destMap: Record<string, string> = {
      'استانبول': '/destination/turkey/istanbul',
      'آنتالیا': '/destination/turkey/antalya',
      'وان': '/destination/turkey/van',
      'دبی': '/destination/uae/dubai',
      'کیش': '/destination/iran/kish',
      'مشهد': '/destination/iran/mashhad',
      'پوکت': '/destination/thailand/phuket',
      'بالی': '/destination/thailand/phuket',
      'مسکو': '/destination/russia/moscow',
      'سن پترزبورگ': '/destination/russia/moscow',
    };
    return destMap[tour] || '/tours';
  };

  const handleSuggestionClick = (tour: string) => {
    setSearchQuery(tour);
    setIsFocused(false);
    if (onNavigate) {
      onNavigate(getDestinationPath(tour));
    }
  };

  const handleSearch = () => {
    if (isSearching) return;
    setIsSearching(true);
    setIsFocused(false);
    setTimeout(() => {
      setIsSearching(false);
      if (onNavigate) {
        if (searchQuery.trim()) {
          onNavigate(getDestinationPath(searchQuery.trim()));
        } else {
          onNavigate('/tours');
        }
      }
    }, 400);
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
              تاریخ و قیمت‌های به‌روز، ارائه برنامه سفر شخصی و رزرو هتل‌های مطمئن
            </p>
            
            {/* Search Field */}
            <div ref={searchContainerRef} className="w-full max-w-[850px] mt-8 mb-6 relative">
              <div className="flex flex-col sm:flex-row items-stretch search-hero p-2 gap-2 sm:gap-0">
                <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 w-full relative">
                  <MapPin className="w-5 h-5 text-text-secondary shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setIsFocused(true)}
                    placeholder={isDesktop ? "مقصد یا تور (مثلاً استانبول)" : "نام مقصد..."} 
                    className="w-full bg-transparent border-none outline-none text-text-heading placeholder:text-text-secondary/60 text-body-sm font-medium"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn btn-medium btn-primary w-full sm:w-[130px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال جستجو...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>جستجوی تور</span>
                    </>
                  )}
                </button>
              </div>

              {/* Popular Destinations Chips (Shown when field is focused and empty) */}
              <AnimatePresence>
                {isFocused && !searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="mt-3 flex flex-wrap items-center gap-2 px-1 text-right"
                  >
                    <span className="text-caption text-text-secondary font-medium shrink-0 ml-1">
                      مقصدهای محبوب:
                    </span>
                    {DESTINATIONS.filter(d => d.popular).slice(0, 5).map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(dest.name);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium bg-surface-primary hover:bg-brand-orange-soft text-text-heading hover:text-brand-orange border border-border-default/80 hover:border-brand-orange/40 transition-all cursor-pointer shadow-subtle"
                      >
                        <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{dest.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Autocomplete Dropdown (Shown when typing, max 3 relevant items) */}
              <AnimatePresence>
                {isFocused && searchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-50 mt-2 bg-surface-primary border border-border-default/80 rounded-2xl shadow-elevated overflow-hidden text-right"
                  >
                    <div className="py-1.5">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((dest, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSuggestionClick(dest.name);
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-right hover:bg-page-background transition-colors cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                            <span className="font-medium text-body-sm text-text-heading">{dest.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-right">
                          <p className="text-body-sm font-medium text-text-heading">مقصدی با این نام پیدا نشد</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Visual Content - Left (RTL) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`relative lg:h-[500px] xl:h-[600px] flex items-center justify-center px-2 sm:px-0 w-full transition-all duration-300 ease-in-out ${
              isFocused ? 'mt-8 sm:mt-10 lg:mt-0' : 'mt-2 sm:mt-4 lg:mt-0'
            }`}
          >
            {/* Main Image Grid Composition */}
            <div className="relative w-full max-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-none grid grid-cols-12 gap-3.5 sm:gap-4 md:gap-6">
              <div className="col-span-7 flex flex-col h-full">
                <img 
                  src="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=800&auto=format&fit=crop" 
                  alt="استانبول" 
                  className="w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[420px] object-cover rounded-card md:rounded-feature shadow-floating"
                />
              </div>
              <div className="col-span-5 flex flex-col gap-3.5 sm:gap-4 md:gap-6 translate-y-6 sm:translate-y-8">
                <img 
                  src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" 
                  alt="دبی" 
                  className="w-full h-[90px] sm:h-[140px] md:h-[170px] lg:h-[200px] object-cover rounded-card md:rounded-feature shadow-card"
                />
                <img 
                  src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop" 
                  alt="تایلند" 
                  className="w-full h-[90px] sm:h-[140px] md:h-[170px] lg:h-[200px] object-cover rounded-card md:rounded-feature shadow-card"
                />
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
