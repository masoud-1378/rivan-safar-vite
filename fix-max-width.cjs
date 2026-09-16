const fs = require('fs');

function replaceFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(search, replace);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
}

// SeoIntro max-w-text
replaceFile('src/components/SeoIntro.tsx', 
  /className="text-text-primary\/90 text-body leading-\[2\.1\] space-y-4 font-normal"/g, 
  'className="text-text-primary/90 text-body leading-[2.1] space-y-4 font-normal max-w-text mx-auto"'
);

// ToursPage text-[13.5px] -> text-body-sm
replaceFile('src/components/ToursPage.tsx', /text-\[13\.5px\]/g, 'text-body-sm');

// TravelNeeds subtitle
replaceFile('src/components/TravelNeeds.tsx', 
  /className="text-body-sm lg:text-\[16px\] text-text-secondary"/g,
  'className="text-body-lg text-text-secondary max-w-subtitle mx-auto"'
);

