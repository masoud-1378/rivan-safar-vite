const fs = require('fs');

let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

// Fix selects
content = content.replace(
  /className="bg-surface-primary border border-border-default rounded-control px-3 py-2 text-body-sm font-bold text-text-heading focus:outline-none focus:border-border-brand shadow-subtle"/g,
  'className="form-input form-select font-bold shadow-subtle !h-10"' // making it smaller if it was h-10? Wait, it was py-2 so it was around 40px. I'll just use "form-input form-select !h-10 text-body-sm" to not break the layout of sorting.
);

content = content.replace(
  /className="w-full bg-page-background border border-border-default rounded-small p-2 font-medium"/g,
  'className="form-input form-select text-body-sm"'
);

// Ah, wait. The filter selects are:
content = content.replace(
  /className="w-full bg-page-background border border-border-default rounded-control p-3"/g,
  'className="form-input form-select"'
);

// Fix booking form inputs
content = content.replace(
  /className="bg-white\/10 border border-white\/20 rounded-control px-3\.5 py-2\.5 text-form-input text-white placeholder:text-white\/50 focus:outline-none focus:border-border-brand"/g,
  'className="form-input !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 focus:!border-brand-orange"'
);

// Fix radios
content = content.replace(
  /className="flex items-center gap-2 cursor-pointer font-medium text-text-primary hover:text-brand-orange"/g,
  'className="form-control-wrap text-text-primary hover:text-brand-orange font-medium"'
);

content = content.replace(
  /className="text-brand-orange focus:ring-brand-orange"/g,
  'className="form-radio"'
);

// Fix checkbox
content = content.replace(
  /className="flex items-center justify-between cursor-pointer"/g,
  'className="form-control-wrap justify-between"'
);

content = content.replace(
  /className="rounded border-border-default text-brand-orange focus:ring-brand-orange w-4 h-4"/g,
  'className="form-checkbox"'
);

// Fix labels in filters
content = content.replace(
  /className="font-bold text-text-heading block mb-1"/g,
  'className="form-label mb-2 block"'
);

fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
