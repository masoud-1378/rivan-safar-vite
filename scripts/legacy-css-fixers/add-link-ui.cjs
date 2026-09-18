const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newUtilities = `
@utility text-link-ui {
  font-size: clamp(14px, 1vw, 15px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-brand-orange);
}
`;

css += newUtilities;

fs.writeFileSync('src/index.css', css, 'utf8');

