const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Numbers
  content = content.replace(/text-body-lg md:text-xl font-black tracking-tight text-brand-orange/g, 'text-price tracking-tight text-brand-orange');
  content = content.replace(/text-h3 tracking-tight text-brand-orange/g, 'text-price tracking-tight text-brand-orange');
  content = content.replace(/text-xl font-black tracking-tight text-brand-orange/g, 'text-price tracking-tight text-brand-orange');
  content = content.replace(/text-xl md:text-2xl font-black tracking-tight text-brand-orange/g, 'text-price-lg tracking-tight text-brand-orange');
  content = content.replace(/text-lg sm:text-xl font-black tracking-tight text-brand-orange/g, 'text-price tracking-tight text-brand-orange');
  content = content.replace(/text-lg sm:text-xl md:text-2xl font-black tracking-tight text-brand-orange/g, 'text-price tracking-tight text-brand-orange');
  
  // Toman
  content = content.replace(/text-\[9px\] sm:text-caption font-bold/g, 'text-caption');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed Prices:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
