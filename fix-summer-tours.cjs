const fs = require('fs');

let content = fs.readFileSync('src/components/SummerTours.tsx', 'utf8');

// I'll use regex to match the card and replace it.
const regex = /\{\/\* Main Card \*\/\}\s*<div className="card-tour">[\s\S]*?(?=\{\/\* Mobile Scroll Spacer End \*\/\})/;

const replacement = `{/* Main Card */}
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

                <div className="card-tour-content text-right">
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
                      <Plane className="w-3.5 h-3.5 text-text-heading" />
                      <span>حمل و نقل</span>
                    </div>
                    <div className="badge badge-outline">
                      <Building2 className="w-3.5 h-3.5 text-text-heading" />
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
              </div>
            </motion.div>
          ))}
          
          `;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/SummerTours.tsx', content, 'utf8');

