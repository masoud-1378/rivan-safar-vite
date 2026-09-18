const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (filePath.endsWith('Navbar.tsx')) {
    content = content.replace(/font-bold text-\[15px\] text-text-heading mb-5 border-r-2/g, 'text-h4 text-text-heading mb-5 border-r-2');
  }

  if (filePath.endsWith('Footer.tsx')) {
    content = content.replace(/text-white text-\[15px\] font-semibold/g, 'text-h4 text-white font-semibold');
  }

  if (filePath.endsWith('ToursPage.tsx')) {
    content = content.replace(/text-\[14px\] sm:text-\[15px\] font-bold/g, 'text-h4');
    content = content.replace(/font-bold text-\[15px\]/g, 'text-h4');
    content = content.replace(/text-lg md:text-xl font-bold/g, 'text-h3');
    content = content.replace(/text-lg font-bold/g, 'text-h3');
    content = content.replace(/text-base sm:text-lg md:text-xl font-black/g, 'text-h3');
    // For specific cases like: <h3 className="font-bold text-text-heading text-base">
    content = content.replace(/font-bold text-text-heading text-base/g, 'text-h4 text-text-heading');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed h3/h4:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
