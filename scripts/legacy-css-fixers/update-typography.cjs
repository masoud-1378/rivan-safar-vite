const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Buttons
  // bg-brand-orange text-on-brand font-bold text-[13px] -> text-btn
  content = content.replace(/bg-brand-orange text-on-brand font-bold text-\[13px\]/g, 'bg-brand-orange text-on-brand text-btn');
  // text-[14px] font-bold text-brand-orange border-2
  content = content.replace(/text-\[14px\] font-bold text-brand-orange border-2/g, 'text-btn text-brand-orange border-2');
  content = content.replace(/text-brand-orange font-bold text-\[14px\]/g, 'text-brand-orange text-btn');
  // text-[13px] flex items-center justify-center gap-2 (ToursPage)
  content = content.replace(/text-center text-\[13px\] flex items-center/g, 'text-center text-btn flex items-center');
  
  // 2. Menu Navigation
  // Navbar.tsx `font-medium text-[15px]` -> `text-nav`
  if (filePath.endsWith('Navbar.tsx')) {
    content = content.replace(/font-medium text-\[15px\]/g, 'text-nav');
    // Sub-items text-[14px]
    content = content.replace(/text-\[14px\] text-text-primary/g, 'text-body-sm text-text-primary');
    // text-[13.5px] -> text-body-sm
    content = content.replace(/text-\[13\.5px\]/g, 'text-body-sm');
  }

  // 3. Footer
  if (filePath.endsWith('Footer.tsx')) {
    content = content.replace(/text-\[14px\] sm:text-\[15px\]/g, 'text-body');
    content = content.replace(/text-\[13px\] sm:text-\[14px\]/g, 'text-body-sm');
    content = content.replace(/text-\[13px\]/g, 'text-body-sm');
    // H4
    content = content.replace(/text-h4 text-white font-semibold/g, 'text-h4 text-white');
  }

  // 4. Prices
  // ToursPage, Destinations, OriginCities etc.
  // We have numbers with text-[15px], text-[16px], text-[18px], text-xl, font-black etc for prices.
  content = content.replace(/text-lg sm:text-xl md:text-2xl font-black text-text-heading dir-ltr/g, 'text-price text-text-heading dir-ltr');
  content = content.replace(/text-lg font-black text-text-heading dir-ltr/g, 'text-price text-text-heading dir-ltr');
  content = content.replace(/text-xl font-black text-brand-orange/g, 'text-price text-brand-orange');
  content = content.replace(/text-xl md:text-2xl font-black text-text-heading dir-ltr/g, 'text-price text-text-heading dir-ltr');
  content = content.replace(/text-2xl font-black text-text-heading/g, 'text-price-lg text-text-heading');
  
  // تومان styling
  content = content.replace(/text-\[11px\] sm:text-\[12px\] text-text-secondary font-bold/g, 'text-caption text-text-secondary');
  content = content.replace(/text-xs sm:text-sm text-text-secondary font-bold/g, 'text-caption text-text-secondary');
  content = content.replace(/text-xs md:text-sm text-text-secondary font-bold/g, 'text-caption text-text-secondary');
  content = content.replace(/text-sm text-text-secondary font-bold/g, 'text-caption text-text-secondary');
  content = content.replace(/text-\[11px\] text-text-secondary font-bold/g, 'text-caption text-text-secondary');
  content = content.replace(/text-\[12px\] text-text-secondary font-bold/g, 'text-caption text-text-secondary');

  // شروع قیمت از
  content = content.replace(/text-\[11px\] sm:text-\[12px\] text-text-secondary mb-1/g, 'text-caption text-text-secondary mb-1');
  content = content.replace(/text-xs md:text-sm text-text-secondary mb-1/g, 'text-caption text-text-secondary mb-1');
  content = content.replace(/text-xs sm:text-sm text-text-secondary mb-1/g, 'text-caption text-text-secondary mb-1');
  content = content.replace(/text-\[11px\] text-text-secondary font-medium mb-1/g, 'text-caption text-text-secondary mb-1');
  content = content.replace(/text-xs text-text-secondary mb-1/g, 'text-caption text-text-secondary mb-1');
  
  // 5. Card Titles
  content = content.replace(/text-\[14px\] sm:text-\[15px\] lg:text-\[16px\] font-bold text-text-heading line-clamp-1/g, 'text-card-title text-text-heading line-clamp-1');
  content = content.replace(/text-base sm:text-lg font-bold text-text-heading line-clamp-2/g, 'text-card-title text-text-heading line-clamp-2');
  content = content.replace(/text-base md:text-lg font-bold text-text-heading line-clamp-2/g, 'text-card-title text-text-heading line-clamp-2');
  content = content.replace(/text-\[15px\] md:text-\[16px\] font-bold text-text-heading mb-2/g, 'text-card-title text-text-heading mb-2');
  content = content.replace(/text-lg sm:text-xl font-bold text-text-heading mb-3/g, 'text-card-title text-text-heading mb-3');
  // H3 is used in Destinations "text-xl md:text-2xl font-black mb-1 drop-shadow-subtle"
  if (filePath.endsWith('Destinations.tsx')) {
    content = content.replace(/<h3 className="text-xl md:text-2xl font-black mb-1/g, '<h3 className="text-h3 text-white mb-1');
  }

  // 6. Body Texts (Body, Body Small, Caption)
  // Body Large:
  content = content.replace(/text-\[16px\] md:text-\[18px\]/g, 'text-body-lg');
  content = content.replace(/text-base sm:text-lg/g, 'text-body-lg');
  
  // Body
  content = content.replace(/text-\[15px\] sm:text-\[16px\]/g, 'text-body');
  content = content.replace(/text-\[15px\] md:text-\[16px\]/g, 'text-body');
  content = content.replace(/text-\[14px\] sm:text-\[16px\]/g, 'text-body');
  
  // Body Small
  content = content.replace(/text-\[13px\] sm:text-\[14px\] lg:text-\[15px\]/g, 'text-body-sm');
  content = content.replace(/text-\[13px\] sm:text-\[14px\]/g, 'text-body-sm');
  content = content.replace(/text-sm sm:text-base/g, 'text-body-sm');
  content = content.replace(/text-\[13px\]/g, 'text-body-sm');
  content = content.replace(/text-sm/g, 'text-body-sm');
  
  // Caption
  content = content.replace(/text-\[12px\]/g, 'text-caption');
  content = content.replace(/text-xs/g, 'text-caption');
  content = content.replace(/text-\[11px\]/g, 'text-caption');
  content = content.replace(/text-\[10px\]/g, 'text-caption');

  // Label
  // specific replacing of `font-medium` or `font-semibold` might be tricky so we just replace classes directly

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
