const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('--font-sans: "Vazirmatn", system-ui, sans-serif;', `--font-family-primary: "Vazirmatn", Tahoma, Arial, sans-serif;\n  --font-sans: var(--font-family-primary);\n\n  --font-weight-regular: 400;\n  --font-weight-medium: 500;\n  --font-weight-semibold: 600;\n  --font-weight-bold: 700;\n  --font-weight-extrabold: 800;`);

css += `
@utility text-display {
  font-size: clamp(2.25rem, 4vw, 4rem);
  line-height: 1.25;
  font-weight: 800;
  text-wrap: balance;
}
@utility text-h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1.35;
  font-weight: 800;
  text-wrap: balance;
}
@utility text-h2 {
  font-size: clamp(1.625rem, 2.5vw, 2.5rem);
  line-height: 1.4;
  font-weight: 700;
  text-wrap: balance;
}
@utility text-h3 {
  font-size: clamp(1.375rem, 1.8vw, 1.75rem);
  line-height: 1.5;
  font-weight: 700;
  text-wrap: balance;
}
@utility text-h4 {
  font-size: clamp(1.125rem, 1.4vw, 1.375rem);
  line-height: 1.55;
  font-weight: 600;
  text-wrap: balance;
}
@utility text-eyebrow {
  font-size: 14px;
  line-height: 1.6;
  font-weight: 700;
}
`;

fs.writeFileSync('src/index.css', css, 'utf8');
