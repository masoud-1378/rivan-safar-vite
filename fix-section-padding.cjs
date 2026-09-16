const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace various py-* on sections with section-standard
  content = content.replace(/className="([^"]*)py-\[48px\] md:py-\[64px\] lg:py-\[72px\]([^"]*)"/g, 'className="$1section-standard$2"');
  content = content.replace(/className="([^"]*)py-\[56px\] md:py-\[72px\] lg:py-\[92px\]([^"]*)"/g, 'className="$1section-standard$2"');
  content = content.replace(/className="([^"]*)py-12 md:py-16([^"]*)"/g, 'className="$1section-standard$2"');
  content = content.replace(/className="([^"]*)py-12 md:py-20([^"]*)"/g, 'className="$1section-standard$2"');
  content = content.replace(/className="([^"]*)py-\[48px\] md:py-\[60px\] lg:py-\[84px\]([^"]*)"/g, 'className="$1section-standard$2"');
  
  // ToursPage specific
  content = content.replace(/className="([^"]*)py-8 md:py-12([^"]*)"/g, 'className="$1section-standard$2"');
  
  // For sections with py-8, replace with section-compact
  // E.g. <section className="container-main px-4 sm:px-6 lg:px-8 py-8">
  content = content.replace(/className="([^"]*)py-8([^"]*)"/g, function(match, p1, p2) {
    if (p1.includes('border-y') || p2.includes('border-y')) {
        return `className="${p1}section-compact${p2}"`;
    }
    // TrustBar has py-0 but it's not matched here.
    return `className="${p1}section-compact${p2}"`;
  });

  // For sections with py-10 my-4 -> section-compact 
  content = content.replace(/className="([^"]*)py-10 my-4([^"]*)"/g, 'className="$1section-compact$2"');
  
  // Remove my-8 if they have section-compact
  content = content.replace(/section-compact my-8/g, 'section-compact');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
