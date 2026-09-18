const fs = require('fs');
let content = fs.readFileSync('src/components/ExhibitionTours.tsx', 'utf8');

const targetExhibitionCard = `              <div className="relative w-full h-[260px] md:h-[300px] rounded-card md:rounded-feature overflow-hidden shadow-card group-hover:shadow-floating transition-all duration-500 cursor-pointer z-10 bg-surface-primary group-hover:-translate-y-1">
                {/* Image Container */}
                <motion.img 
                  src={tour.image} 
                  alt={tour.title}
                  className="absolute inset-0 w-full h-full object-cover origin-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Content Container */}
                <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end z-20 text-white">
                  <div className="mt-auto mb-4 flex flex-col gap-1">
                    <h3 className="text-h3 text-white mb-1 drop-shadow-subtle group-hover:-translate-x-1 transition-transform duration-300">
                      {tour.title}
                    </h3>
                  </div>
                  
                  <div className="pt-4 border-t border-white/20 flex items-center justify-between group-hover:border-white/40 transition-colors duration-300">
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className="text-caption sm:text-caption text-gray-300 font-medium">شروع از</span>
                      <span className="text-body-lg md:text-xl font-black drop-shadow-subtle tracking-tight">{tour.price}</span>
                      <span className="text-[9px] sm:text-caption text-gray-300 font-bold">تومان</span>
                    </div>
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-primary/10 group-hover:bg-surface-primary/20 transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>`;

const newExhibitionCard = `              <div className="card-destination">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="card-destination-image"
                />

                <div className="absolute top-4 right-4 z-20">
                  <div className="badge bg-surface-dark/40 backdrop-blur border-white/10 text-white">
                    <Presentation className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{tour.badge}</span>
                  </div>
                </div>

                <div className="card-destination-overlay" />

                <div className="card-destination-content">
                  <h3 className="card-destination-title">
                    {tour.title}
                  </h3>
                  <div className="card-destination-subtitle">
                    {tour.duration}
                  </div>
                  
                  <div className="card-destination-footer">
                    <div>
                      <div className="card-destination-price-label">شروع از</div>
                      <div className="flex items-baseline">
                        <span className="card-destination-price-value">{tour.price}</span>
                        <span className="card-destination-price-label">تومان</span>
                      </div>
                    </div>
                    <div className="card-destination-icon-btn">
                      <svg className="w-4 h-4 rotate-180 card-destination-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>`;

content = content.replace(targetExhibitionCard, newExhibitionCard);
fs.writeFileSync('src/components/ExhibitionTours.tsx', content, 'utf8');
