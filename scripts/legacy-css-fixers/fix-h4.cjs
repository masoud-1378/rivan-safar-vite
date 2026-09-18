const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (filePath.endsWith('ToursPage.tsx')) {
    content = content.replace(/<h4 className="font-bold text-text-heading mb-1">/g, '<h4 className="text-h4 text-text-heading mb-1">');
    content = content.replace(/<h4 className="font-bold text-text-heading mb-3 text-\[14px\]">/g, '<h4 className="text-h4 text-text-heading mb-3">');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed h4:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
