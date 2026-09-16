const fs = require('fs');

let content = fs.readFileSync('src/components/SummerTours.tsx', 'utf8');

content = content.replace(/<span>\{tour\.date\}<\/span>/g, '<span>{tour.duration}</span>');

fs.writeFileSync('src/components/SummerTours.tsx', content, 'utf8');
