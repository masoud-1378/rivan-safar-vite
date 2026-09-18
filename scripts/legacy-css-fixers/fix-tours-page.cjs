const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

content = content.replace(
  /className="hidden lg:block lg:col-span-3 bg-surface-primary rounded-card border border-border-default p-5 sticky top-28 shadow-subtle"/g,
  'className="hidden lg:block lg:col-span-3 filter-sidebar sticky top-28 shadow-subtle"'
);

// We need to fix the Mobile Filter Panel
content = content.replace(
  /<div className="bg-surface-primary rounded-t-3xl w-full max-h-\[85vh\] overflow-y-auto p-6 text-right">/g,
  '<div className="filter-panel-mobile w-full text-right">'
);

content = content.replace(
  /<div className="flex items-center justify-between mb-4 pb-3 border-b border-border-default">/g,
  '<div className="filter-panel-header">'
);

content = content.replace(
  /<div className="space-y-4 text-body-sm">/g,
  '<div className="filter-panel-body space-y-4 text-body-sm">'
);

fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
