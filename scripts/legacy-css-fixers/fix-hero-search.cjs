const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Replace the container
content = content.replace(
  /className="flex flex-col sm:flex-row items-stretch bg-surface-primary rounded-card p-2 sm:p-2 shadow-card border border-border-default\/40 relative z-20 gap-2 sm:gap-0"/g,
  'className="flex flex-col sm:flex-row items-stretch search-hero p-2 gap-2 sm:gap-0"'
);

// Replace dropdown
content = content.replace(
  /className="absolute top-full left-0 right-0 mt-2 bg-surface-primary rounded-control shadow-floating border border-border-default\/40 overflow-hidden z-10"/g,
  'className="dropdown-panel"'
);

// Replace option
content = content.replace(
  /className="w-full text-right px-5 py-3 hover:bg-page-background transition-colors flex items-center gap-3 text-text-heading"/g,
  'className="dropdown-option"'
);

fs.writeFileSync('src/components/Hero.tsx', content, 'utf8');
