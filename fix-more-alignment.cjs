const fs = require('fs');

function replaceFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(search, replace);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
}

// OriginCities: remove container-main from inner grid
replaceFile('src/components/OriginCities.tsx', / gap-4 md:gap-6 container-main"/g, ' gap-4 md:gap-6"');

// TrustBar: fix padding
replaceFile('src/components/TrustBar.tsx', /container-main px-4 md:px-0/g, 'container-main px-4 sm:px-6 lg:px-8');

// Navbar: container-wide -> container-main
replaceFile('src/components/Navbar.tsx', /container-wide px-4 sm:px-6 lg:px-8/g, 'container-main px-4 sm:px-6 lg:px-8');

// Footer: wait for results, but probably it's container-main already because I replaced max-w-7xl with container-main
replaceFile('src/components/Footer.tsx', /container-wide px-4 sm:px-6 lg:px-8/g, 'container-main px-4 sm:px-6 lg:px-8');

