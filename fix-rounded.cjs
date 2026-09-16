const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/rounded-\[18px\]/g, 'rounded-card');
  content = content.replace(/rounded-\[20px\]/g, 'rounded-card');
  content = content.replace(/rounded-\[28px\]/g, 'rounded-feature');
  content = content.replace(/rounded-\[6px\]/g, 'rounded-small');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed rounded:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
