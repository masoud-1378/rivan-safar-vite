const fs = require('fs');

let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');
content = content.replace(/className="text-body-sm font-bold text-text-heading">فقط تورهای بدون ویزا<\/span>/, 'className="text-form-label text-text-heading">فقط تورهای بدون ویزا</span>');
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
