const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Containers
  content = content.replace(/max-w-7xl mx-auto/g, 'container-main');
  content = content.replace(/max-w-\[1240px\] mx-auto/g, 'container-main');
  content = content.replace(/max-w-\[1400px\] mx-auto/g, 'container-wide');
  content = content.replace(/max-w-\[960px\] mx-auto/g, 'container-text');

  // Text max-widths
  content = content.replace(/max-w-2xl mx-auto/g, 'max-w-subtitle mx-auto');
  content = content.replace(/max-w-lg mb-8/g, 'max-w-hero mb-8');

  // Standardize desktop padding (if md:px-8 or lg:px-8 is there, leave it for now since mobile/tablet shouldn't be touched much, but wait, we can just ensure they all have px-4 sm:px-6 lg:px-8 or similar.
  // Actually, let's just do a blanket replace for the padding string on containers to be px-4 sm:px-6 lg:px-8
  content = content.replace(/px-4 sm:px-6 md:px-8/g, 'px-4 sm:px-6 lg:px-8');
  content = content.replace(/px-4 md:px-6/g, 'px-4 sm:px-6 lg:px-8');
  content = content.replace(/px-4 md:px-8/g, 'px-4 sm:px-6 lg:px-8');
  
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
