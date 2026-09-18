const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

content = content.replace(
  /{showSuggestions && filteredSuggestions\.length > 0 && \(/g,
  '{showSuggestions && ('
);

fs.writeFileSync('src/components/Hero.tsx', content, 'utf8');
