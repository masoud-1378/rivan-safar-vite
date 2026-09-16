const fs = require('fs');

let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

// Apply filter buttons
content = content.replace(
  /className="w-full bg-brand-orange text-on-brand font-bold py-3 rounded-control"/g,
  'className="btn btn-primary btn-large text-btn w-full"'
);

// Mobile sticky call
content = content.replace(
  /className="flex-1 bg-brand-orange text-on-brand font-bold py-2\.5 rounded-control text-center text-btn flex items-center justify-center gap-2"/g,
  'className="btn btn-primary btn-medium text-btn flex-1"'
);

// Clear filters button
content = content.replace(
  /className="w-full sm:w-auto bg-brand-orange text-on-brand text-btn px-5 py-2\.5 rounded-control hover:bg-brand-orange-hover transition-colors"/g,
  'className="btn btn-primary btn-medium text-btn w-full sm:w-auto"'
);

// Expert contact
content = content.replace(
  /className="w-full sm:w-auto bg-page-background text-text-heading border border-border-default font-bold text-body-sm px-5 py-2\.5 rounded-control hover:bg-brand-orange-soft transition-colors"/g,
  'className="btn btn-outline btn-medium text-btn w-full sm:w-auto"'
);

// Load more
content = content.replace(
  /className="bg-surface-primary border-2 border-brand-navy hover:border-border-brand hover:text-brand-orange text-text-heading font-bold text-\[14px\] px-8 py-3 rounded-control transition-all shadow-subtle"/g,
  'className="btn btn-outline btn-medium text-btn px-8 shadow-subtle bg-surface-primary"'
);

// clearAllFilters desktop
content = content.replace(
  /className="text-caption font-bold text-brand-orange hover:underline mr-auto"/g,
  'className="text-link text-caption mr-auto"'
);

content = content.replace(
  /className="text-\[11\.5px\] font-bold text-brand-orange hover:underline"/g,
  'className="text-link text-[11.5px]"'
);

// Close modal icon button
content = content.replace(
  /className="absolute top-4 left-4 p-1\.5 bg-page-background rounded-full text-text-secondary hover:text-text-heading"/g,
  'className="absolute top-4 left-4 icon-btn icon-btn-medium bg-page-background text-text-secondary hover:text-text-heading rounded-full"'
);

// Mobile sticky filter button
content = content.replace(
  /className="flex-1 bg-surface-primary text-text-heading border border-border-default font-bold py-2\.5 rounded-control text-center text-btn flex items-center justify-center gap-2"/g,
  'className="btn btn-outline btn-medium text-btn flex-1 bg-surface-primary"'
);

fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
