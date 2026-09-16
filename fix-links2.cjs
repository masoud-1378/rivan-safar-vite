const fs = require('fs');
let content = fs.readFileSync('src/components/ExhibitionTours.tsx', 'utf8');
content = content.replace(/className="group flex items-center gap-1\.5 sm:gap-2 text-brand-orange hover:text-brand-orange-hover font-bold text-caption sm:text-body-sm md:text-base transition-colors"/g, 'className="group flex items-center gap-1.5 sm:gap-2 text-link-ui hover:underline underline-offset-4 transition-colors"');
fs.writeFileSync('src/components/ExhibitionTours.tsx', content, 'utf8');
