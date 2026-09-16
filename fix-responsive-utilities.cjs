const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Update section padding utilities
css = css.replace(/@utility section-compact {[\s\S]*?}/, `@utility section-compact {
  padding-block: 32px;
  @media (min-width: 640px) { padding-block: 48px; }
  @media (min-width: 1024px) { padding-block: 64px; }
}`);

css = css.replace(/@utility section-standard {[\s\S]*?}/, `@utility section-standard {
  padding-block: 48px;
  @media (min-width: 640px) { padding-block: 64px; }
  @media (min-width: 1024px) { padding-block: 80px; }
}`);

css = css.replace(/@utility section-spacious {[\s\S]*?}/, `@utility section-spacious {
  padding-block: 64px;
  @media (min-width: 640px) { padding-block: 80px; }
  @media (min-width: 1024px) { padding-block: 96px; }
}`);

fs.writeFileSync('src/index.css', css, 'utf8');
