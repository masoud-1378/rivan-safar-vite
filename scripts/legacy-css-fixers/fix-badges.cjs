const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/<span className="text-caption sm:text-caption font-bold">\{dest.badge\}<\/span>/g, '<span className="text-badge">{dest.badge}</span>');
  content = content.replace(/<span className="text-caption sm:text-caption font-bold">\{tour.badge\}<\/span>/g, '<span className="text-badge">{tour.badge}</span>');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed Badges:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
