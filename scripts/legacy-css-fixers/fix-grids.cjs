const fs = require('fs');

function replaceFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(search, replace);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed grid in:', file);
  }
}

const horizontalScrollRegex1 = /className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 pt-4 pb-8 -mt-3 -mx-4 sm:-mx-6 md:mx-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible md:snap-none \[\&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:none\] \[scrollbar-width:none\] touch-pan-x"/g;
const horizontalScrollRegex2 = /className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 pt-4 pb-8 -mt-3 -mx-4 sm:-mx-6 md:mx-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible md:snap-none \[\&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:none\] \[scrollbar-width:none\] touch-pan-x px-4 sm:px-6 md:px-0"/g;
const horizontalScrollRegex3 = /className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 sm:gap-6 pt-4 pb-8 -mt-3 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:snap-none \[\&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:none\] \[scrollbar-width:none\] touch-pan-x"/g;

const newGridClass = 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"';

replaceFile('src/components/Destinations.tsx', horizontalScrollRegex1, newGridClass);
replaceFile('src/components/SummerTours.tsx', horizontalScrollRegex2, newGridClass);
replaceFile('src/components/ExhibitionTours.tsx', horizontalScrollRegex3, newGridClass);

// For TravelNeeds.tsx, it's currently grid-cols-2 lg:grid-cols-2. Mobile should be grid-cols-1 or 2. "کارت نیاز سفر: Desktop: 2 یا 3 ستون Tablet: 2 ستون Mobile: 2 ستون فشرده"
// So `grid-cols-2` is correct for mobile, tablet, and desktop!

