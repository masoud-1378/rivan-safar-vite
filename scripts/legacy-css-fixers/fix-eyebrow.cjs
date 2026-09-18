const fs = require('fs');

let content = fs.readFileSync('src/components/SeoIntro.tsx', 'utf8');
content = content.replace(/className="text-\[13px\] sm:text-\[14px\] font-semibold text-brand-orange block mb-1"/g, 'className="text-eyebrow text-brand-orange block mb-1"');
fs.writeFileSync('src/components/SeoIntro.tsx', content, 'utf8');
