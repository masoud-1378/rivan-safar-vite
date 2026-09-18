const fs = require('fs');

const file = './src/components/ToursPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Regex to remove the two layers in ToursPage.tsx
content = content.replace(/\{\/\*\s*Layer 2 \([^\}]+\)\s*\*\/\}\n\s*<div[^>]*\/>/g, '');
content = content.replace(/\{\/\*\s*Layer 1 \([^\}]+\)\s*\*\/\}\n\s*<div[^>]*\/>/g, '');
content = content.replace(/\{\/\*\s*Layer 2[^\n]*\n\s*<div[^>]*\/>/g, '');
content = content.replace(/\{\/\*\s*Layer 1[^\n]*\n\s*<div[^>]*\/>/g, '');

fs.writeFileSync(file, content, 'utf8');

const summerFile = './src/components/SummerTours.tsx';
let summerContent = fs.readFileSync(summerFile, 'utf8');
summerContent = summerContent.replace(/\{\/\*\s*Layer 2 \([^\}]+\)\s*\*\/\}\n\s*<div[^>]*\/>/g, '');
summerContent = summerContent.replace(/\{\/\*\s*Layer 1 \([^\}]+\)\s*\*\/\}\n\s*<div[^>]*\/>/g, '');
summerContent = summerContent.replace(/\{\/\*\s*Layer 2[^\n]*\n\s*<div[^>]*\/>/g, '');
summerContent = summerContent.replace(/\{\/\*\s*Layer 1[^\n]*\n\s*<div[^>]*\/>/g, '');

fs.writeFileSync(summerFile, summerContent, 'utf8');

