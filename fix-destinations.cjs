const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const replacementArray = `const DESTINATIONS = [
  { name: 'استانبول', country: 'ترکیه', type: 'شهر', popular: true },
  { name: 'آنتالیا', country: 'ترکیه', type: 'شهر', popular: true },
  { name: 'وان', country: 'ترکیه', type: 'شهر', popular: false },
  { name: 'دبی', country: 'امارات', type: 'شهر', popular: true },
  { name: 'پوکت', country: 'تایلند', type: 'جزیره', popular: true },
  { name: 'پاتایا', country: 'تایلند', type: 'شهر', popular: false },
  { name: 'بالی', country: 'اندونزی', type: 'جزیره', popular: true },
  { name: 'کیش', country: 'ایران', type: 'جزیره', popular: true },
  { name: 'مشهد', country: 'ایران', type: 'شهر', popular: true },
  { name: 'قشم', country: 'ایران', type: 'جزیره', popular: false },
];`;

content = content.replace(/const ALL_TOURS = \[[\s\S]*?\];/, replacementArray);

fs.writeFileSync('src/components/Hero.tsx', content, 'utf8');
