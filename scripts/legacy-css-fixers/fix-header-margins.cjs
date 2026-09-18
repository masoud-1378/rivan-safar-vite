const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Header wrapper margins
  content = content.replace(/mb-8 md:mb-14/g, 'mb-8');
  content = content.replace(/mb-8 md:mb-10/g, 'mb-8');
  content = content.replace(/mb-8 md:mb-12/g, 'mb-8');
  content = content.replace(/mb-6 md:mb-8/g, 'mb-8');
  content = content.replace(/mb-6 md:mb-10/g, 'mb-8');
  content = content.replace(/mb-6 sm:mb-8/g, 'mb-8');

  // Subtitle spacing
  content = content.replace(/mt-3 sm:mt-4/g, 'mt-2'); // 8px subtitle space
  content = content.replace(/mt-4/g, 'mt-3');
  
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
