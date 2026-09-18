const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const targetStr = `<div className="bg-surface-primary rounded-card border border-border-default p-8 text-center max-w-xl mx-auto">
                <AlertCircle className="w-12 h-12 text-brand-orange mx-auto mb-3 opacity-80" />
                <h3 className="text-h3 text-text-heading mb-2">برای این ترکیب، تور فعالی پیدا نکردیم</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
                  تاریخ یا بودجه را تغییر بده یا اجازه بده کارشناس ریوان سفر گزینه‌های نزدیک را بررسی کند.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={clearAllFilters}
                    className="btn btn-primary btn-medium text-btn w-full sm:w-auto"
                  >
                    پاک‌کردن فیلترها
                  </button>
                  <a 
                    href="tel:02633350139"
                    className="btn btn-outline btn-medium text-btn w-full sm:w-auto"
                  >
                    درخواست بررسی توسط کارشناس
                  </a>
                </div>`;

const replaceStr = `<div className="empty-state">
                <div className="empty-state-icon">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="empty-state-title">توری مطابق این جستجو پیدا نشد</h3>
                <p className="empty-state-desc">
                  تاریخ یا فیلترها را تغییر بده یا پیشنهادهای نزدیک را ببین.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={clearAllFilters}
                    className="btn btn-primary btn-medium text-btn w-full sm:w-auto"
                  >
                    مشاهده همه تورها
                  </button>
                  <button 
                    onClick={clearAllFilters}
                    className="text-link text-body-sm font-medium"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
