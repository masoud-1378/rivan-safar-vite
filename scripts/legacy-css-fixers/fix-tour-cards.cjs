const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const targetCard = `                    <div
                      key={tour.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedDetailTour(tour)}
                    >
                      {/* Layer 2 (Lowest) */}
                      
                      
                      {/* Layer 1 (Middle) */}
                      

                      {/* Main Card */}
                      <div className="relative w-full h-full bg-surface-primary rounded-card md:rounded-feature border border-border-default shadow-card group-hover:shadow-floating transition-all duration-500 group-hover:-translate-y-1 overflow-hidden flex flex-col z-10">
                        {/* Image */}
                        <div className="relative h-[160px] sm:h-[180px] overflow-hidden shrink-0">
                          <img 
                            src={tour.image} 
                            alt={tour.title}
                            referrerPolicy="no-referrer"
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
                        <div className="p-4 sm:p-5 flex flex-col flex-grow text-right">
                          <h3 className="text-h3 text-text-heading mb-6 md:mb-8 sm:mb-4 group-hover:text-brand-orange transition-colors leading-snug">
                            {tour.title}
                          </h3>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                            <div className="badge lg:cursor-help group/tag relative">
                              <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-text-heading" />
                              <span className="lg:hidden">حمل و نقل</span>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                حمل و نقل
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                              </div>
                            </div>

                            <div className="badge lg:cursor-help group/tag relative">
                              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-text-heading" />
                              <span className="lg:hidden">اقامت</span>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                اقامت
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                              </div>
                            </div>

                            {tour.visaRequired ? (
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
                              <span className="text-price tracking-tight text-brand-orange">{tour.formattedPrice}</span>
                              <span className="text-caption text-text-secondary">تومان</span>
                            </div>
                            <span className="text-link text-caption group-hover:text-brand-orange-hover">
                              مشاهده جزئیات
                              <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>`;

const replaceCard = `                    <div
                      key={tour.id}
                      className="card-tour"
                      onClick={() => setSelectedDetailTour(tour)}
                    >
                      <div className="card-tour-image-container">
                        <img 
                          src={tour.image} 
                          alt={tour.title}
                          referrerPolicy="no-referrer"
                          className="card-tour-image"
                        />
                        <div className="absolute top-3 right-3 z-20">
                          <div className="chip-duration shadow-subtle">
                            <Clock className="w-3.5 h-3.5 text-brand-orange" />
                            <span className="text-caption font-bold">{tour.duration}</span>
                          </div>
                        </div>
                        {!tour.visaRequired && (
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
                          <span>تهران → {tour.destination}</span>
                        </div>
                        
                        <div className="card-tour-features">
                          {tour.flight && (
                            <div className="badge badge-outline">
                              <Plane className="w-3.5 h-3.5" />
                              <span>پرواز {tour.flight}</span>
                            </div>
                          )}
                          {tour.hotelOptions?.[0] && (
                            <div className="badge badge-outline">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>هتل {tour.hotelOptions[0].stars} ستاره</span>
                            </div>
                          )}
                        </div>

                        <div className="card-tour-footer">
                          <div>
                            <div className="card-tour-price-label">شروع قیمت از</div>
                            <div className="flex items-baseline">
                              <span className="card-tour-price-value">{tour.formattedPrice}</span>
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

content = content.replace(targetCard, replaceCard);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
