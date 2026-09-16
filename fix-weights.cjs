const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/font-weight: 800;/g, 'font-weight: var(--font-weight-extrabold);');
css = css.replace(/font-weight: 700;/g, 'font-weight: var(--font-weight-bold);');
css = css.replace(/font-weight: 600;/g, 'font-weight: var(--font-weight-semibold);');
css = css.replace(/font-weight: 500;/g, 'font-weight: var(--font-weight-medium);');
css = css.replace(/font-weight: 400;/g, 'font-weight: var(--font-weight-regular);');

fs.writeFileSync('src/index.css', css, 'utf8');
