const fs = require('fs');

function fixLinksInFile(file, classSearchStr, classReplaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(classSearchStr, classReplaceStr);
  fs.writeFileSync(file, content, 'utf8');
}

// 1. TravelGuide Desktop Link
fixLinksInFile('src/components/TravelGuide.tsx', 
  /className="hidden md:inline-flex items-center gap-2 px-4 py-2\.5 rounded-control border border-brand-navy\/15 text-\[14px\] font-semibold text-text-heading hover:text-brand-orange hover:border-brand-orange\/30 hover:bg-brand-orange\/5 transition-all duration-200 group shrink-0"/g,
  'className="hidden md:inline-flex items-center gap-1.5 text-link-ui hover:underline underline-offset-4 transition-colors group shrink-0"'
);

// 2. TravelGuide Mobile Link
fixLinksInFile('src/components/TravelGuide.tsx', 
  /className="inline-flex items-center justify-center gap-2 w-full py-3\.5 px-4 rounded-control border border-brand-navy\/20 text-text-heading font-semibold text-\[14px\] hover:bg-surface-dark\/5 active:bg-surface-dark\/10 transition-colors"/g,
  'className="inline-flex items-center justify-center gap-1.5 w-full mt-6 text-link-ui hover:underline underline-offset-4 transition-colors group"'
);

fixLinksInFile('src/components/Destinations.tsx', 
  /className="group flex items-center gap-1\.5 sm:gap-2 text-brand-orange hover:text-brand-orange-hover font-bold text-caption sm:text-body-sm md:text-base transition-colors"/g,
  'className="group flex items-center gap-1.5 sm:gap-2 text-link-ui hover:underline underline-offset-4 transition-colors"'
);

fixLinksInFile('src/components/ExhibitionTours.tsx', 
  /className="group flex items-center gap-1\.5 sm:gap-2 text-brand-orange hover:text-brand-orange-hover font-bold text-\[13px\] sm:text-sm md:text-base transition-colors"/g,
  'className="group flex items-center gap-1.5 sm:gap-2 text-link-ui hover:underline underline-offset-4 transition-colors"'
);
