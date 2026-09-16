const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace classnames of motion.h2
  // We'll use a regex to target the classname inside motion.h2 specifically if we can, or just replace the known ones.

  content = content.replace(/className="text-2xl md:text-4xl lg:text-\[2\.5rem\] font-black text-text-heading tracking-tight"/g, 'className="text-h2 text-text-heading"');
  content = content.replace(/className="text-2xl md:text-3xl lg:text-4xl font-black text-text-heading tracking-tight"/g, 'className="text-h2 text-text-heading"');
  content = content.replace(/className="text-xl sm:text-2xl md:text-4xl lg:text-\[2\.5rem\] font-black text-text-heading tracking-tight"/g, 'className="text-h2 text-text-heading"');
  content = content.replace(/className="text-xl sm:text-2xl md:text-4xl lg:text-\[2\.5rem\] font-black text-text-heading tracking-tight flex items-center gap-3"/g, 'className="text-h2 text-text-heading flex items-center gap-3"');
  content = content.replace(/className="text-\[23px\] sm:text-\[25px\] lg:text-\[36px\] font-bold text-text-heading leading-\[1\.4\] mb-2 sm:mb-2\.5"/g, 'className="text-h2 text-text-heading mb-2 sm:mb-2.5"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed motion.h2:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
