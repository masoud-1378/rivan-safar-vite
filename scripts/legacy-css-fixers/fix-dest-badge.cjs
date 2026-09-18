const fs = require('fs');

let content = fs.readFileSync('src/components/Destinations.tsx', 'utf8');

content = content.replace(
  /<div className="chip-duration transition-transform duration-300 group-hover:scale-105">\s*<Star className="w-3\.5 h-3\.5 text-brand-orange" \/>\s*<span className="text-badge">\{dest\.badge\}<\/span>\s*<\/div>/g,
  '<div className="badge"><Star className="w-3.5 h-3.5 text-brand-orange" /><span>{dest.badge}</span></div>'
);

fs.writeFileSync('src/components/Destinations.tsx', content, 'utf8');
