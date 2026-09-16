const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/gap-5 lg:gap-6/g, 'gap-4 lg:gap-6');
  content = content.replace(/gap-3 sm:gap-4 md:gap-5/g, 'gap-4 md:gap-6');
  content = content.replace(/grid-cols-4 gap-5/g, 'grid-cols-4 gap-6');
  content = content.replace(/grid-cols-3 gap-5/g, 'grid-cols-3 gap-6');
  
  // ToursPage gap-3 to gap-4 for grids
  content = content.replace(/grid-cols-3 gap-3/g, 'grid-cols-3 gap-4');
  content = content.replace(/grid-cols-2 gap-3/g, 'grid-cols-2 gap-4');

  // OriginCities max-w-5xl -> container-main
  if (filePath.endsWith('OriginCities.tsx')) {
    content = content.replace(/max-w-5xl mx-auto/g, 'container-main');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
