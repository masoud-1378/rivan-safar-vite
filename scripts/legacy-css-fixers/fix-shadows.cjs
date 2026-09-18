const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/shadow-\[[^\]]+\]/g, (match) => {
    // Determine based on content or just map large shadows to floating and medium to card
    // 40px/50px -> floating
    // 24px/32px -> card
    // 10px/20px -> subtle (if small opacity like 0.02) or card
    if (match.includes('40px') || match.includes('48px') || match.includes('50px')) return 'shadow-floating';
    if (match.includes('24px') || match.includes('30px') || match.includes('32px')) return 'shadow-card';
    if (match.includes('20px') || match.includes('28px')) return 'shadow-card';
    return 'shadow-subtle';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated shadows:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
