const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newUtilities = `
@utility container-main {
  max-width: 1240px;
  margin-inline: auto;
}
@utility container-wide {
  max-width: 1440px;
  margin-inline: auto;
}
@utility container-text {
  max-width: 900px;
  margin-inline: auto;
}
@utility section-compact {
  padding-block: 64px;
}
@utility section-standard {
  padding-block: 80px;
}
@utility section-spacious {
  padding-block: 96px;
}
@utility max-w-text {
  max-width: 75ch;
}
@utility max-w-subtitle {
  max-width: 60ch;
}
@utility max-w-hero {
  max-width: 42ch;
}
`;

css += newUtilities;

fs.writeFileSync('src/index.css', css, 'utf8');
