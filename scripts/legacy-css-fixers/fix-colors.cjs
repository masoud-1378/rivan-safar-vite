const fs = require('fs');

function processFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(
    /className="group\/tag relative bg-page-background border border-border-default px-2 py-1 sm:px-2\.5 sm:py-1\.5 lg:p-2 rounded-small sm:rounded-small lg:rounded-control flex items-center justify-center gap-1 sm:gap-1\.5 text-text-secondary lg:hover:bg-page-background transition-colors lg:cursor-help"/g,
    'className="badge lg:cursor-help group/tag relative"'
  );

  content = content.replace(
    /className="group\/tag relative bg-blue-50 border border-blue-100 px-2 py-1 sm:px-2\.5 sm:py-1\.5 lg:p-2 rounded-small sm:rounded-small lg:rounded-control flex items-center justify-center gap-1 sm:gap-1\.5 text-blue-600 lg:hover:bg-blue-100 transition-colors lg:cursor-help"/g,
    'className="badge lg:cursor-help group/tag relative"'
  );

  content = content.replace(
    /className="group\/tag relative bg-green-50 border border-green-100 px-2 py-1 sm:px-2\.5 sm:py-1\.5 lg:p-2 rounded-small sm:rounded-small lg:rounded-control flex items-center justify-center gap-1 sm:gap-1\.5 text-green-600 lg:hover:bg-green-100 transition-colors lg:cursor-help"/g,
    'className="badge badge-info lg:cursor-help group/tag relative"'
  );

  content = content.replace(
    /<span className="text-caption lg:hidden">پشتیبانی<\/span>/g,
    '<span className="lg:hidden">بدون ویزا</span>'
  );
  
  content = content.replace(
    /پشتیبانی\s*<div className="absolute top-full left-1\/2 -translate-x-1\/2 border-4 border-transparent border-t-brand-navy" \/>/g,
    'بدون ویزا\n<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />'
  );
  
  content = content.replace(
    /<span className="text-caption lg:hidden">ویزا<\/span>/g,
    '<span className="lg:hidden">نیاز به ویزا</span>'
  );
  
  content = content.replace(
    /ویزا\s*<div className="absolute top-full left-1\/2 -translate-x-1\/2 border-4 border-transparent border-t-brand-navy" \/>/g,
    'نیاز به ویزا\n<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy" />'
  );
  
  content = content.replace(
    /<span className="text-caption lg:hidden">حمل و نقل<\/span>/g,
    '<span className="lg:hidden">حمل و نقل</span>'
  );
  
  content = content.replace(
    /<span className="text-caption lg:hidden">اقامت<\/span>/g,
    '<span className="lg:hidden">اقامت</span>'
  );

  fs.writeFileSync(path, content, 'utf8');
}

processFile('src/components/ToursPage.tsx');
processFile('src/components/SummerTours.tsx');
