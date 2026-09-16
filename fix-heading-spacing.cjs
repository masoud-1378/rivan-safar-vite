const fs = require('fs');

function replaceFile(file, regex, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(regex, replaceStr);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
}

// 1. SeoIntro (no subtitle) mb-4 -> mb-8
replaceFile('src/components/SeoIntro.tsx', 
  /className="text-h2 text-text-heading mb-4"/g, 
  'className="text-h2 text-text-heading mb-8"'
);

// 2. TravelNeeds (has subtitle) mb-2 sm:mb-2.5 -> mb-2
// And check wrapper margin if present
replaceFile('src/components/TravelNeeds.tsx',
  /className="text-h2 text-text-heading mb-2 sm:mb-2\.5"/g,
  'className="text-h2 text-text-heading mb-2"'
);

// 3. ToursPage 
replaceFile('src/components/ToursPage.tsx', /<h2 className="text-h2 text-text-heading mb-4 text-right">/g, '<h2 className="text-h2 text-text-heading mb-8 text-right">');
replaceFile('src/components/ToursPage.tsx', /<h2 className="text-h2 text-text-heading mb-3">/g, '<h2 className="text-h2 text-text-heading mb-8">');

// E.g. tours page lines 898 to 905
// <h2 className="text-h2 text-text-heading"> مقالات مرتبط راهنمای رزرو تور </h2> 
// and then grid directly. So we need mb-8 here.
replaceFile('src/components/ToursPage.tsx', /<h2 className="text-h2 text-text-heading">مقالات/g, '<h2 className="text-h2 text-text-heading mb-8">مقالات');

replaceFile('src/components/ToursPage.tsx', /<h2 className="text-h2 text-text-heading mb-4">\{selectedDetailTour\.title\}<\/h2>/g, '<h2 className="text-h2 text-text-heading mb-8">{selectedDetailTour.title}</h2>');

