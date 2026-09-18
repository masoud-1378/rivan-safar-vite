const fs = require('fs');

let tours = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

// Duration Chip
tours = tours.replace(
  /className="bg-white\/80 backdrop-blur-sm px-3 py-1\.5 rounded-full shadow-subtle text-text-heading transition-transform duration-300 group-hover:scale-105 flex items-center gap-1\.5"/g,
  'className="chip-duration transition-transform duration-300 group-hover:scale-105"'
);

// Tags replacement
// We will replace the whole block of tags with a cleaner structure.
const tagsRegex = /<div className="flex flex-wrap items-center gap-1\.5 sm:gap-2 mb-4 sm:mb-5">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="mt-auto/g;

tours = tours.replace(tagsRegex, (match) => {
  // Let's manually reconstruct the tags area to use standard badges
  return `<div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
                            <div className="badge lg:cursor-help group/tag relative">
                              <Plane className="w-3.5 h-3.5" />
                              <span className="lg:hidden">حمل و نقل</span>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                حمل و نقل
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                              </div>
                            </div>
                            <div className="badge lg:cursor-help group/tag relative">
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="lg:hidden">اقامت</span>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                اقامت
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                              </div>
                            </div>
                            {tour.visaRequired ? (
                              <div className="badge lg:cursor-help group/tag relative">
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span className="lg:hidden">نیاز به ویزا</span>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                  نیاز به ویزا
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                                </div>
                              </div>
                            ) : (
                              <div className="badge badge-info lg:cursor-help group/tag relative">
                                <Headset className="w-3.5 h-3.5" />
                                <span className="lg:hidden">بدون ویزا</span>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-caption px-2 py-1 rounded-small opacity-0 invisible lg:group-hover/tag:opacity-100 lg:group-hover/tag:visible transition-all whitespace-nowrap hidden lg:block z-20">
                                  بدون ویزا
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-auto`;
});

fs.writeFileSync('src/components/ToursPage.tsx', tours, 'utf8');
