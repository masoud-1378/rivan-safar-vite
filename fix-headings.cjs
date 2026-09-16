const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Hero.tsx h1
  if (filePath.endsWith('Hero.tsx')) {
    content = content.replace(/text-\[2\.25rem\][^"]*font-black text-text-heading[^"]*/, 'text-display text-text-heading mb-5 sm:mb-6');
  }

  // ToursPage.tsx h1
  if (filePath.endsWith('ToursPage.tsx')) {
    content = content.replace(/<h1 className="[^"]*text-2xl[^"]*font-extrabold[^"]*">/, '<h1 className="text-h1 text-text-heading mb-3">');
  }

  // Replacing h2
  // We want to replace `<h2 className="...">` with standard sizes if it's a section title.
  // TravelGuide.tsx
  if (filePath.endsWith('TravelGuide.tsx')) {
    content = content.replace(/<h2 className="text-\[24px\][^"]*font-bold text-text-heading[^"]*">/, '<h2 className="text-h2 text-text-heading">');
  }

  // SeoIntro.tsx
  if (filePath.endsWith('SeoIntro.tsx')) {
    content = content.replace(/<h2 className="text-\[22px\][^"]*font-bold text-text-heading[^"]*">/, '<h2 className="text-h2 text-text-heading mb-4">');
  }

  // ToursPage.tsx h2s
  if (filePath.endsWith('ToursPage.tsx')) {
    content = content.replace(/<h2 className="text-xl md:text-2xl font-black text-text-heading">/g, '<h2 className="text-h2 text-text-heading">');
    content = content.replace(/<h2 className="text-xl md:text-2xl font-black text-text-heading mb-2">/g, '<h2 className="text-h2 text-text-heading mb-2">');
    content = content.replace(/<h2 className="text-xl font-bold text-text-heading mb-4 text-right">/g, '<h2 className="text-h2 text-text-heading mb-4 text-right">');
    content = content.replace(/<h2 className="text-xl font-bold text-text-heading">/g, '<h2 className="text-h2 text-text-heading">');
    content = content.replace(/<h2 className="text-xl font-bold text-text-heading mb-3">/g, '<h2 className="text-h2 text-text-heading mb-3">');
    content = content.replace(/<h2 className="text-xl font-black text-text-heading mb-4">/g, '<h2 className="text-h2 text-text-heading mb-4">');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed h1/h2:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
