const fs = require('fs');

let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

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

content = content.replace(target, replacement);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
