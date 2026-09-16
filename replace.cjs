const fs = require('fs');
const path = require('path');

const dir = './src/components';
const appFile = './src/App.tsx';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-brand-ivory/g, 'bg-page-background');
  content = content.replace(/bg-brand-surface/g, 'bg-surface-primary');
  content = content.replace(/bg-brand-navy/g, 'bg-surface-dark');
  content = content.replace(/bg-brand-dark/g, 'bg-surface-dark');
  content = content.replace(/bg-brand-orange-50/g, 'bg-brand-orange-soft');
  content = content.replace(/bg-brand-orange-500/g, 'bg-brand-orange');
  content = content.replace(/bg-brand-orange-600/g, 'bg-brand-orange-hover');
  content = content.replace(/bg-brand-orange-700/g, 'bg-brand-orange-active');
  content = content.replace(/bg-brand-border/g, 'bg-border-default');

  // Text
  content = content.replace(/text-brand-charcoal/g, 'text-text-primary');
  content = content.replace(/text-brand-navy/g, 'text-text-heading');
  content = content.replace(/text-brand-dark/g, 'text-text-heading');
  content = content.replace(/text-brand-gray/g, 'text-text-secondary');
  content = content.replace(/text-brand-orange-500/g, 'text-brand-orange');
  content = content.replace(/text-brand-orange-600/g, 'text-brand-orange-hover');
  content = content.replace(/text-brand-orange-400/g, 'text-brand-orange-soft');
  content = content.replace(/text-brand-orange/g, 'text-brand-orange'); // Already there maybe?
  
  // Need to fix case where `text-white` on `bg-brand-orange` buttons should be `text-on-brand` according to rules:
  // "متن روی دکمه نارنجی باید سرمه‌ای تیره باشد: color: var(--color-text-on-brand);"
  // Let's do this carefully with a regex where bg-brand-orange is followed by text-white
  content = content.replace(/bg-brand-orange([^"']*?)text-white/g, 'bg-brand-orange$1text-on-brand');
  
  // Borders
  content = content.replace(/border-brand-border/g, 'border-border-default');
  content = content.replace(/border-brand-orange-500\/20/g, 'border-border-brand');
  content = content.replace(/border-brand-orange-500/g, 'border-border-brand');
  
  // Radius mapping
  content = content.replace(/rounded-md/g, 'rounded-small');
  content = content.replace(/rounded-lg/g, 'rounded-small');
  content = content.replace(/rounded-xl/g, 'rounded-control');
  content = content.replace(/rounded-2xl/g, 'rounded-card');
  content = content.replace(/rounded-3xl/g, 'rounded-feature');
  content = content.replace(/rounded-\[16px\]/g, 'rounded-control');
  content = content.replace(/rounded-\[24px\]/g, 'rounded-card');
  content = content.replace(/rounded-\[32px\]/g, 'rounded-feature');
  content = content.replace(/rounded-\[14px\]/g, 'rounded-control');
  content = content.replace(/rounded-\[8px\]/g, 'rounded-small');
  content = content.replace(/rounded-\[10px\]/g, 'rounded-small');
  content = content.replace(/rounded-\[12px\]/g, 'rounded-control');
  
  // Shadows
  content = content.replace(/shadow-sm/g, 'shadow-subtle');
  content = content.replace(/shadow-md/g, 'shadow-subtle');
  content = content.replace(/shadow-lg/g, 'shadow-card');
  content = content.replace(/shadow-xl/g, 'shadow-floating');
  content = content.replace(/shadow-\[0_8px_30px_rgba\(0,0,0,0\.08\)\]/g, 'shadow-card');
  content = content.replace(/shadow-\[0_20px_40px_rgba\(0,0,0,0\.15\)\]/g, 'shadow-floating');

  // Hardcoded colors removal
  content = content.replace(/bg-\[\#FAF7F2\]/gi, 'bg-page-background');
  content = content.replace(/bg-\[\#F7F9FA\]/gi, 'bg-surface-secondary');
  content = content.replace(/bg-\[\#102A3A\]/gi, 'bg-surface-dark');
  content = content.replace(/bg-\[\#19394A\]/gi, 'bg-surface-dark-raised');

  // Cleanup semantic colors
  // Replace emerald/green with success, blue with info, amber/yellow with warning, red with danger
  // only if they are being used semantically. Actually let's just let Tailwind's text-green-600 be if it's semantic.
  // Wait, the prompt says "استفاده از رنگ‌های سبز و آبی صرفاً تزئینی جلوگیری کن". We should check if they are semantic.
  
  // Fix specific card backgrounds that were #F7F9FA or similar.
  // We'll see if there are any left.
  
  // Specific fix for ToursPage.tsx layered shadows (removing decorative gray layers under cards)
  if (filePath.includes('ToursPage.tsx') || filePath.includes('SummerTours.tsx')) {
    // We should remove decorative layers. In ToursPage.tsx we saw:
    // {/* Layer 2 (Lowest) */}
    // <div className="absolute -bottom-3 left-6 right-6 h-[90%] bg-brand-border/60 rounded-[24px] md:rounded-[32px] transition-all duration-500 group-hover:translate-y-2 group-hover:opacity-40 z-0" />
    // {/* Layer 1 (Middle) */}
    // <div className="absolute -bottom-1.5 left-3 right-3 h-[95%] bg-brand-ivory/90 rounded-[24px] md:rounded-[32px] shadow-sm transition-all duration-500 group-hover:translate-y-1 group-hover:opacity-70 z-0" />
    
    // We can just remove these lines by regex.
    content = content.replace(/\{\/\*\s*Layer 2[^\}]+\*\/\}\s*<div[^>]+Layer 2[^>]+>\s*<\/div>\s*/g, '');
    content = content.replace(/\{\/\*\s*Layer 1[^\}]+\*\/\}\s*<div[^>]+Layer 1[^>]+>\s*<\/div>\s*/g, '');
    
    // Let's use a broader regex to remove these layers
    content = content.replace(/<div className="absolute -bottom-[0-9.]+ left-[0-9.]+ right-[0-9.]+ h-\[[0-9]+%\] bg-[^"]+ z-0" \/>/g, '');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

processFile(appFile);
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
