const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const targetStr = `
                <div className="pt-2">
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="btn btn-primary btn-large text-btn w-full"
                  >
                    اعمال فیلترها ({filteredTours.length} تور)
                  </button>
                </div>
              </div>`;

const replaceStr = `
              </div>
              <div className="filter-panel-footer">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="btn btn-primary w-full"
                >
                  نمایش نتایج ({filteredTours.length} تور)
                </button>
                <button 
                  onClick={clearAllFilters}
                  className="btn btn-secondary"
                >
                  پاک کردن
                </button>
              </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
