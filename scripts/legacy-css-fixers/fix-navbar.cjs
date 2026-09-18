const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  /className="bg-brand-orange text-on-brand text-btn py-2\.5 px-4 rounded-small hover:bg-brand-orange-hover transition-colors text-center shadow-card shadow-brand-orange\/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"/g,
  'className="btn btn-primary btn-medium w-full text-btn shadow-card"'
);

content = content.replace(
  /className="bg-brand-orange text-on-brand text-btn py-2\.5 px-4 rounded-small hover:bg-brand-orange-hover transition-colors shadow-subtle inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ivory"/g,
  'className="btn btn-primary btn-medium text-btn shadow-subtle inline-flex"'
);

content = content.replace(
  /className="flex items-center justify-center gap-2 bg-brand-orange text-on-brand px-4 py-3 rounded-control font-bold shadow-subtle shadow-brand-orange\/20 hover:bg-brand-orange-hover transition-colors mb-2\.5"/g,
  'className="btn btn-primary btn-medium text-btn w-full shadow-subtle mb-2.5"'
);

fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
