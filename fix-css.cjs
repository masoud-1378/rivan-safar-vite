const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/@utility (btn[^ ]*|text-link|icon-btn[^ ]*)/g, '.$1');

fs.writeFileSync('src/index.css', css, 'utf8');
