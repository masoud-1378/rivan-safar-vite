const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const targetStr = `          {/* Quick Selection Paths */}
          <div className="flex items-center justify-center flex-wrap gap-2 max-w-[1000px] mx-auto">
            {[
              { label: 'تورهای خارجی', action: () => setSelectedType('foreign') },
              { label: 'تورهای داخلی', action: () => setSelectedType('domestic') },
              { label: 'تورهای بدون ویزا', action: () => setVisaFreeOnly(true) },
              { label: 'تورهای اقتصادی', action: () => setPriceRange('under-30m') },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.action}
                className="chip chip-standard shadow-subtle"
              >
                {chip.label}
              </button>
            ))}
          </div>`;

const replaceStr = `          {/* Search Compact */}
          <div className="max-w-[700px] mx-auto mt-8">
            <div className="search-compact flex-col sm:flex-row !h-auto sm:!h-12 p-2 sm:p-0 gap-2 sm:gap-0">
              <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-0 w-full min-h-[44px] sm:min-h-0">
                <Search className="w-5 h-5 text-text-secondary shrink-0" />
                <input 
                  type="text" 
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="جستجوی نام مقصد، شهر یا کشور..." 
                  className="w-full bg-transparent border-none outline-none text-text-heading placeholder:text-text-secondary/60 text-body-sm font-medium"
                />
              </div>
              <div className="hidden sm:block search-divider"></div>
              <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-0 w-full min-h-[44px] sm:min-h-0 border-t sm:border-t-0 border-border-default/40">
                <Calendar className="w-5 h-5 text-text-secondary shrink-0" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-text-heading text-body-sm font-medium cursor-pointer"
                >
                  <option value="all">همه تاریخ‌ها</option>
                  <option value="فروردین">فروردین</option>
                  <option value="اردیبهشت">اردیبهشت</option>
                  <option value="خرداد">خرداد</option>
                  <option value="تابستان">تابستان</option>
                  <option value="پاییز">پاییز</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
              {[
                { label: 'تورهای خارجی', action: () => setSelectedType('foreign') },
                { label: 'تورهای داخلی', action: () => setSelectedType('domestic') },
                { label: 'تورهای بدون ویزا', action: () => setVisaFreeOnly(true) },
                { label: 'تورهای اقتصادی', action: () => setPriceRange('under-30m') },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.action}
                  className="chip chip-standard shadow-subtle"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
