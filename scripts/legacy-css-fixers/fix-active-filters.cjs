const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const regex = /\{\/\* Active Filter Chips \*\/\}([\s\S]*?)\{\/\* Catalog 2-Column Grid \*\/\}/g;

content = content.replace(regex, (match) => {
  return `{/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mb-6 bg-surface-primary p-3 md:p-4 rounded-control border border-border-default overflow-x-auto whitespace-nowrap scrollbar-hide">
            {selectedType !== 'all' && (
              <span className="chip chip-small chip-selected">
                {selectedType === 'foreign' ? 'خارجی' : selectedType === 'domestic' ? 'داخلی' : 'نمایشگاهی'}
                <button onClick={() => setSelectedType('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {searchDestination && (
              <span className="chip chip-small chip-selected">
                {searchDestination}
                <button onClick={() => setSearchDestination('')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {selectedMonth !== 'all' && (
              <span className="chip chip-small chip-selected">
                {selectedMonth}
                <button onClick={() => setSelectedMonth('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {visaFreeOnly && (
              <span className="chip chip-small chip-selected">
                بدون ویزا
                <button onClick={() => setVisaFreeOnly(false)} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="chip chip-small chip-selected">
                {priceRange === 'under-30m' ? 'تا ۳۰ میلیون' : priceRange === '30m-60m' ? '۳۰ تا ۶۰ میلیون' : 'بالای ۶۰ میلیون'}
                <button onClick={() => setPriceRange('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-link text-caption mr-auto mr-4 shrink-0"
            >
              پاک کردن همه
            </button>
          </div>
        )}
        
        {/* Catalog 2-Column Grid */}`;
});

fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
