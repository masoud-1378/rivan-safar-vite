const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We had previously set mb-8 everywhere in fix-header-margins.cjs
  // We need to change `mb-8` to `mb-6 md:mb-8` for header wrappers.
  
  // Specific sections where we have header wrappers:
  // OriginCities.tsx: `<div className="mb-10 md:mb-14` was changed to `mb-8` ?
  // Wait, I did `content = content.replace(/mb-8 md:mb-14/g, 'mb-8');`
  
  // Let's just find `<div className="mb-8` that are followed by `flex` or contain `motion.h2` or `h2`.
  // A simpler regex for `mb-8 flex items-center justify-between` -> `mb-6 md:mb-8 flex items-center justify-between`
  content = content.replace(/className="mb-8 flex/g, 'className="mb-6 md:mb-8 flex');
  content = content.replace(/className="mb-8 md:mb-14/g, 'className="mb-6 md:mb-8');
  content = content.replace(/className="mb-8 md:mb-10/g, 'className="mb-6 md:mb-8');
  content = content.replace(/className="mb-10 md:mb-14/g, 'className="mb-6 md:mb-8'); // OriginCities
  
  // ToursPage has `<h2 className="text-h2 text-text-heading mb-8">`
  content = content.replace(/text-text-heading mb-8/g, 'text-text-heading mb-6 md:mb-8');
  content = content.replace(/text-text-heading mb-4/g, 'text-text-heading mb-6 md:mb-8'); // Any stragglers
  content = content.replace(/text-text-heading mb-3/g, 'text-text-heading mb-6 md:mb-8'); 
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed Headers:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
