const fs = require('fs');

function processFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Duration Chip
  content = content.replace(
    /className="bg-white\/80 backdrop-blur-sm px-3 py-1\.5 rounded-full shadow-subtle text-text-heading transition-transform duration-300 group-hover:scale-105 flex items-center gap-1\.5"/g,
    'className="chip-duration transition-transform duration-300 group-hover:scale-105"'
  );

  // OriginCities badge brand
  content = content.replace(
    /className="bg-brand-orange-soft text-brand-orange px-4 py-1\.5 rounded-full text-caption font-bold mb-4 flex items-center gap-2"/g,
    'className="badge badge-brand mb-4"'
  );

  // Filter chips in ToursPage (Haven't chosen a destination yet)
  content = content.replace(
    /className="bg-page-background hover:bg-brand-orange-soft text-text-heading hover:text-brand-orange font-medium text-body-sm px-4 py-2 rounded-control border border-border-default transition-colors"/g,
    'className="chip chip-standard"'
  );

  // Filter chips (Hero or generic ones)
  content = content.replace(
    /className="bg-surface-primary border border-border-default text-text-heading text-caption font-medium h-\[38px\] px-4 rounded-full hover:border-border-brand hover:text-brand-orange transition-all hover:bg-brand-orange-soft\/50 shadow-subtle"/g,
    'className="chip chip-standard shadow-subtle"'
  );

  fs.writeFileSync(path, content, 'utf8');
}

processFile('src/components/Destinations.tsx');
processFile('src/components/SummerTours.tsx');
processFile('src/components/ExhibitionTours.tsx');
processFile('src/components/OriginCities.tsx');
processFile('src/components/ToursPage.tsx');
processFile('src/components/Hero.tsx');

