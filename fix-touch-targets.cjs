const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Drawer button
content = content.replace(
  /className="lg:hidden p-1\.5 text-text-heading hover:text-brand-orange transition-colors"/g,
  'className="lg:hidden w-11 h-11 flex items-center justify-center -mr-2 text-text-heading hover:text-brand-orange transition-colors"'
);

// Close drawer button
content = content.replace(
  /className="p-1\.5 text-text-secondary hover:text-brand-orange transition-colors"/g,
  'className="w-11 h-11 flex items-center justify-center -ml-2 text-text-secondary hover:text-brand-orange transition-colors"'
);

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
