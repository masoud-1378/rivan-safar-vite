const fs = require('fs');
let content = fs.readFileSync('src/components/ExhibitionTours.tsx', 'utf8');

const regex = /<div className="card-destination">[\s\S]*?<\/div>\s*<\/motion\.div>/g;

const replacement = `<a href="#exhibition" className="card-exhibition">
                <div className="card-exhibition-image-container">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="card-exhibition-image"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <div className="badge badge-success">
                      ثبت‌نام باز
                    </div>
                  </div>
                </div>
                <div className="card-exhibition-content">
                  <h3 className="card-exhibition-title">
                    {tour.title}
                  </h3>
                  <div className="card-exhibition-meta">
                    <span className="w-1.5 h-1.5 rounded-full bg-border-strong"></span>
                    دبی، امارات
                  </div>
                  <div className="card-exhibition-meta">
                    <span className="w-1.5 h-1.5 rounded-full bg-border-strong"></span>
                    {tour.duration}
                  </div>
                  
                  <div className="card-exhibition-footer border-t border-border-default mt-4 pt-3">
                    <span className="text-link text-body-sm group-hover:text-brand-orange transition-colors flex items-center gap-1">
                      مشاهده جزئیات
                      <ArrowLeft className="w-4 h-4 card-exhibition-cta" />
                    </span>
                  </div>
                </div>
              </a>
            </motion.div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/ExhibitionTours.tsx', content, 'utf8');
