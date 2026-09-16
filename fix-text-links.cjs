const fs = require('fs');
const path = require('path');
const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  let original = content;

  content = content.replace(/className="group flex items-center gap-1\.5 sm:gap-2 text-link-ui hover:underline underline-offset-4 transition-colors"/g, 'className="text-link text-btn"');
  content = content.replace(/className="hidden md:inline-flex items-center gap-1\.5 text-link-ui hover:underline underline-offset-4 transition-colors group shrink-0"/g, 'className="hidden md:inline-flex text-link text-btn shrink-0"');

  if (content !== original) {
    fs.writeFileSync(path.join(componentsDir, file), content, 'utf8');
    console.log('Fixed text links in:', file);
  }
}
