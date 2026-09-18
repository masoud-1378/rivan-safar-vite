const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace(
  /className="lg:hidden w-11 h-11 flex items-center justify-center -mr-2 text-text-heading hover:text-brand-orange transition-colors"/g,
  'className="lg:hidden icon-btn icon-btn-medium -mr-2 text-text-heading hover:text-brand-orange"'
);
navbar = navbar.replace(
  /className="p-2 bg-page-background text-text-secondary hover:bg-brand-orange-soft hover:text-brand-orange rounded-control transition-colors absolute left-5"/g,
  'className="icon-btn icon-btn-medium absolute left-5 bg-page-background text-text-secondary hover:bg-brand-orange-soft hover:text-brand-orange"'
);
navbar = navbar.replace(
  /className="flex items-center justify-center gap-2 w-full py-3 mt-3 text-btn text-brand-orange border-2 border-border-brand rounded-control hover:bg-brand-orange-soft transition-colors"/g,
  'className="btn btn-outline btn-medium w-full mt-3 text-btn border-border-brand text-brand-orange"'
);
fs.writeFileSync('src/components/Navbar.tsx', navbar, 'utf8');

let tours = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');
tours = tours.replace(
  /<button onClick={\(\) => setShowCompareModal\(false\)} className="p-1 text-text-secondary hover:text-text-heading">/g,
  '<button onClick={() => setShowCompareModal(false)} className="icon-btn icon-btn-small text-text-secondary hover:text-text-heading">'
);
tours = tours.replace(
  /<button onClick={\(\) => setShowMobileFilters\(false\)}>/g,
  '<button onClick={() => setShowMobileFilters(false)} className="icon-btn icon-btn-medium text-text-secondary hover:text-text-heading">'
);
// Also for the filter chips X button
tours = tours.replace(
  /<button onClick={\(\) => set(.*?)\('(.*?)'\)} className="hover:text-brand-orange"><X className="w-3\.5 h-3\.5" \/><\/button>/g,
  '<button onClick={() => set$1(\'$2\')} className="icon-btn icon-btn-small text-text-secondary hover:text-brand-orange"><X className="w-3.5 h-3.5" /></button>'
);
tours = tours.replace(
  /<button onClick={\(\) => setVisaFreeOnly\(false\)} className="hover:text-brand-orange"><X className="w-3\.5 h-3\.5" \/><\/button>/g,
  '<button onClick={() => setVisaFreeOnly(false)} className="icon-btn icon-btn-small text-text-secondary hover:text-brand-orange"><X className="w-3.5 h-3.5" /></button>'
);

fs.writeFileSync('src/components/ToursPage.tsx', tours, 'utf8');

