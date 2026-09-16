const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove the extra spacer divs
  content = content.replace(/<div className="w-px shrink-0 md:hidden" aria-hidden="true" \/>\n/g, '');

  // Remove the scroll-specific classes on cards
  content = content.replace(/snap-start shrink-0 w-\[[0-9]+vw\] sm:w-\[.*?\] md:w-auto /g, '');
  content = content.replace(/snap-start shrink-0 w-\[[0-9]+vw\] sm:w-\[.*?\] md:w-auto/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed Cards:', filePath);
  }
}

['src/components/Destinations.tsx', 'src/components/SummerTours.tsx', 'src/components/ExhibitionTours.tsx'].forEach(processFile);
