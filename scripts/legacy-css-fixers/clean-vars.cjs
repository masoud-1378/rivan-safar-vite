const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/bg-\[var\(--color-(.+?)\)\]/g, 'bg-$1');
  content = content.replace(/text-\[var\(--color-(.+?)\)\]/g, 'text-$1');
  content = content.replace(/border-\[var\(--color-(.+?)\)\]/g, 'border-$1');
  
  // Specific fix for ToursPage and Navbar where text-[var(--color-text-heading)] was used
  // Or text-[var(--color-surface-dark-raised)]
  // We don't have text-surface-dark-raised generated because it's a surface color, but Tailwind allows `text-surface-dark-raised` automatically.

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
