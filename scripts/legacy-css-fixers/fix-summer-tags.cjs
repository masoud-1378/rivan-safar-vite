const fs = require('fs');

let summer = fs.readFileSync('src/components/SummerTours.tsx', 'utf8');

const tagsRegex = /<div className="flex flex-wrap items-center gap-1\.5 sm:gap-2 mb-4 sm:mb-5">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="mt-auto/g;

summer = summer.replace(tagsRegex, (match) => {
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

// also fix the icon button CTA at the bottom of the card
const target = `<div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-page-background group-hover:bg-brand-orange group-hover:text-on-brand text-text-heading transition-colors">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>`;

const replacement = `<span className="text-link text-caption group-hover:text-brand-orange-hover">
                              مشاهده جزئیات
                              <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>`;
summer = summer.replace(target, replacement);

fs.writeFileSync('src/components/SummerTours.tsx', summer, 'utf8');
