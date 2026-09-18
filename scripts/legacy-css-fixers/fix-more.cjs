const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remaining sizes
  content = content.replace(/text-\[14px\] sm:text-\[15px\] lg:text-\[16px\]/g, 'text-body');
  content = content.replace(/text-\[14px\] md:text-\[16px\]/g, 'text-body');
  content = content.replace(/text-\[14px\] text-text-secondary/g, 'text-body-sm text-text-secondary');
  content = content.replace(/text-white font-bold text-\[16px\] mb-2 leading-tight/g, 'text-white font-bold text-body mb-2 leading-tight');
  
  if (filePath.endsWith('Destinations.tsx')) {
    content = content.replace(/<h3 className="text-xl md:text-2xl font-black mb-1/g, '<h3 className="text-h3 text-white mb-1');
  }
  
  if (filePath.endsWith('ExhibitionTours.tsx')) {
    content = content.replace(/<h3 className="text-xl md:text-2xl font-black mb-1 drop-shadow-subtle group-hover:-translate-x-1 transition-transform duration-300">/g, '<h3 className="text-h3 text-white mb-1 drop-shadow-subtle group-hover:-translate-x-1 transition-transform duration-300">');
  }

  // Footer phone number
  if (filePath.endsWith('Footer.tsx')) {
    content = content.replace(/text-\[18px\] font-bold text-white/g, 'text-body-lg font-bold text-white');
    content = content.replace(/text-white text-\[15px\] font-medium/g, 'text-white text-body font-medium');
  }

  // Hero.tsx
  if (filePath.endsWith('Hero.tsx')) {
    content = content.replace(/font-medium text-\[15px\]/g, 'font-medium text-body');
  }
  
  // Navbar.tsx
  if (filePath.endsWith('Navbar.tsx')) {
    content = content.replace(/text-\[17px\]/g, 'text-body-lg');
  }

  // ToursPage.tsx 
  if (filePath.endsWith('ToursPage.tsx')) {
    content = content.replace(/text-\[14px\] flex items-center/g, 'text-body-sm flex items-center');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed More:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
