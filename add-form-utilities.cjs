const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newUtilities = `
@utility text-form-label {
  font-size: 14px;
  line-height: 1.6;
  font-weight: var(--font-weight-medium);
}
@utility text-form-input {
  font-size: 16px;
  line-height: 1.5;
  font-weight: var(--font-weight-regular);
}
@utility text-form-helper {
  font-size: 12px;
  line-height: 1.5;
  font-weight: var(--font-weight-regular);
}
@utility text-form-error {
  font-size: 12px;
  line-height: 1.5;
  font-weight: var(--font-weight-medium);
}
`;

css += newUtilities;

fs.writeFileSync('src/index.css', css, 'utf8');
