const fs = require('fs');

let summerContent = fs.readFileSync('src/components/SummerTours.tsx', 'utf8');

const targetSummerCard = `              {/* Main Card */}
              <div className="relative w-full h-full bg-surface-primary rounded-card md:rounded-feature border border-border-default shadow-card group-hover:shadow-floating transition-all duration-500 group-hover:-translate-y-1 overflow-hidden flex flex-col z-10 cursor-pointer">
                {/* Image */}
                <div className="relative h-[160px] sm:h-[180px] overflow-hidden shrink-0">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                    <div className="chip-duration transition-transform duration-300 group-hover:scale-105">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-caption sm:text-caption font-bold">{tour.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h3 className="text-body-lg md:text-xl font-black text-text-heading mb-6 md:mb-8 sm:mb-4 group-hover:text-brand-orange transition-colors leading-snug">
                    {tour.title}
                  </h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    <div className="badge lg:cursor-help group/tag relative">
                      <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                      <span className="lg:hidden">حمل و نقل</span>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                        حمل و نقل
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                      </div>
                    </div>
                    <div className="badge lg:cursor-help group/tag relative">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                      <span className="lg:hidden">اقامت</span>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                        اقامت
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                      </div>
                    </div>
                    {tour.needsVisa ? (
                      <div className="badge lg:cursor-help group/tag relative">
                        <FileCheck2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                        <span className="lg:hidden">نیاز به ویزا</span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                          نیاز به ویزا
<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                        </div>
                      </div>
                    ) : (
                      <div className="badge badge-info lg:cursor-help group/tag relative">
                        <Headset className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                        <span className="lg:hidden">بدون ویزا</span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                          بدون نیاز به ویزا
<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-border-default flex items-center justify-between group-hover:border-border-default transition-colors duration-300">
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className="text-caption sm:text-caption text-text-secondary font-medium">شروع از</span>
                      <span className="text-price tracking-tight text-brand-orange">{tour.price}</span>
                      <span className="text-[9px] sm:text-caption text-text-secondary font-bold">تومان</span>
                    </div>
                    <span className="text-link text-[10px] sm:text-caption group-hover:text-brand-orange-hover">
                      مشاهده جزئیات
                      <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>`;

const replaceSummerCard = `              {/* Main Card */}
              <div className="card-tour">
                <div className="card-tour-image-container">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="card-tour-image"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <div className="chip-duration shadow-subtle">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-caption font-bold">{tour.duration}</span>
                    </div>
                  </div>
                  {!tour.needsVisa && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="status-badge status-success bg-surface-primary/95 backdrop-blur shadow-subtle">
                        <span className="font-bold">بدون ویزا</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-tour-content">
                  <h3 className="card-tour-title">
                    {tour.title}
                  </h3>
                  
                  <div className="card-tour-meta">
                    <span>{tour.date}</span>
                    <span>·</span>
                    <span>تابستان ۱۴۰۳</span>
                  </div>
                  
                  <div className="card-tour-features">
                    <div className="badge badge-outline">
                      <Plane className="w-3.5 h-3.5" />
                      <span>حمل و نقل</span>
                    </div>
                    <div className="badge badge-outline">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>اقامت</span>
                    </div>
                  </div>

                  <div className="card-tour-footer">
                    <div>
                      <div className="card-tour-price-label">شروع قیمت از</div>
                      <div className="flex items-baseline">
                        <span className="card-tour-price-value">{tour.price}</span>
                        <span className="card-tour-price-label">تومان</span>
                      </div>
                    </div>
                    <span className="text-link text-body-sm font-medium flex items-center gap-1 group">
                      مشاهده جزئیات
                      <ArrowLeft className="w-4 h-4 card-tour-arrow" />
                    </span>
                  </div>
                </div>
              </div>`;

summerContent = summerContent.replace(targetSummerCard, replaceSummerCard);
fs.writeFileSync('src/components/SummerTours.tsx', summerContent, 'utf8');

// ExhibitionTours.tsx
let exhibitionContent = fs.readFileSync('src/components/ExhibitionTours.tsx', 'utf8');

// The ExhibitionTours actually look very similar to Destination cards? Let's check its layout.
