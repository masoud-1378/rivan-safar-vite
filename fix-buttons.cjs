const fs = require('fs');
const path = require('path');

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  let original = content;

  // Primary buttons (ToursPage)
  // <button type="submit" disabled={bookingSubmitted} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-on-brand font-bold py-3 rounded-control transition-colors shadow-card shadow-brand-orange/30">
  content = content.replace(
    /className="w-full bg-brand-orange hover:bg-brand-orange-hover text-on-brand font-bold py-3 rounded-control transition-colors shadow-card shadow-brand-orange\/30"/g,
    'className="btn btn-primary btn-large text-btn w-full"'
  );
  
  content = content.replace(
    /className="bg-brand-orange text-on-brand px-5 py-2\.5 rounded-control hover:bg-brand-orange-hover transition-colors"/g,
    'className="btn btn-primary btn-medium text-btn"'
  );

  // ToursPage (Destinations replace link)
  // <a href="#tour-from-تهران" className="bg-brand-navy hover:bg-brand-navy-hover text-white px-5 py-2.5 rounded-control font-bold transition-colors w-full sm:w-auto text-center inline-block">
  content = content.replace(
    /className="bg-brand-navy hover:bg-brand-navy-hover text-white px-5 py-2\.5 rounded-control font-bold transition-colors w-full sm:w-auto text-center inline-block"/g,
    'className="btn btn-secondary btn-medium text-btn w-full sm:w-auto"'
  );

  content = content.replace(
    /className="w-full bg-surface-dark text-white py-2\.5 rounded-control font-bold hover:bg-brand-orange transition-colors text-[13\.5px]"/g,
    'className="btn btn-secondary btn-medium w-full text-btn hover:!bg-brand-orange"'
  );
  
  // ToursPage compare button
  // <button onClick={() => setShowCompareModal(true)} className="fixed bottom-6 left-1\/2 -translate-x-1\/2 bg-brand-orange text-on-brand font-bold px-6 py-3 rounded-pill shadow-floating z-50 flex items-center gap-2 hover:bg-brand-orange-hover transition-colors text-body-sm">
  content = content.replace(
    /className="fixed bottom-6 left-1\/2 -translate-x-1\/2 bg-brand-orange text-on-brand font-bold px-6 py-3 rounded-pill shadow-floating z-50 flex items-center gap-2 hover:bg-brand-orange-hover transition-colors text-body-sm"/g,
    'className="fixed bottom-6 left-1/2 -translate-x-1/2 btn btn-primary btn-medium rounded-pill shadow-floating z-50 text-btn"'
  );

  // View All buttons (Text Link)
  // <a href="#summer-tours" className="hidden sm:inline-flex items-center gap-1.5 text-brand-orange font-bold text-body-sm hover:gap-2 transition-all">
  content = content.replace(
    /className="hidden sm:inline-flex items-center gap-1\.5 text-brand-orange font-bold text-body-sm hover:gap-2 transition-all"/g,
    'className="hidden sm:inline-flex text-link text-btn"'
  );
  
  // <a href="#destinations" className="hidden sm:inline-flex items-center gap-1.5 text-brand-orange font-bold text-body-sm hover:gap-2 transition-all">
  content = content.replace(
    /className="inline-flex items-center gap-1\.5 text-brand-orange font-bold text-body-sm hover:gap-2 transition-all"/g,
    'className="text-link text-btn"'
  );

  // Exhibition tours
  content = content.replace(
    /className="hidden sm:inline-flex items-center gap-1\.5 text-brand-orange font-bold text-body-sm hover:gap-2 transition-all"/g,
    'className="hidden sm:inline-flex text-link text-btn"'
  );

  // Navbar
  content = content.replace(
    /className={`px-4 py-2 rounded-control text-body-sm font-bold transition-all shadow-subtle \${/g,
    'className={`btn btn-small text-btn shadow-subtle ${'
  );
  content = content.replace(
    /currentView === 'tours' \n                  \? 'bg-brand-orange text-on-brand' \n                  : 'bg-surface-dark hover:bg-brand-orange text-on-brand'/g,
    "currentView === 'tours' ? 'btn-primary' : 'btn-secondary hover:!bg-brand-orange'"
  );

  if (content !== original) {
    fs.writeFileSync(path.join(componentsDir, file), content, 'utf8');
    console.log('Fixed buttons in:', file);
  }
}

