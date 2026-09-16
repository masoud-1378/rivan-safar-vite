const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's replace bg-white with bg-surface-primary, BUT be careful about text-white, border-white, ring-white, etc.
  // We only replace bg-white
  content = content.replace(/bg-white([^/A-Za-z0-9_-])/g, 'bg-surface-primary$1');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed bg-white:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
