const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const targetArray = `const ALL_TOURS = [
  'تور استانبول',
  'تور آنتالیا',
  'تور وان',
  'تور کوش‌آداسی',
  'تور بدروم',
  'تور مارماریس',
  'تور دبی',
  'تور مسقط',
  'تور دوحه',
  'تور مالدیو',
  'تور تایلند',
  'تور بالی',
  'تور کیش',
  'تور مشهد',
  'تور قشم'
];`;

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

content = content.replace(targetArray, replacementArray);

const targetMemo = `  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryWords = searchQuery.toLowerCase().split(/\\s+/).filter(Boolean);
    return ALL_TOURS.filter(tour => {
      const tourLower = tour.toLowerCase();
      return queryWords.every(word => tourLower.includes(word));
    }).slice(0, 3);
  }, [searchQuery]);`;

const replacementMemo = `  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return DESTINATIONS.filter(d => d.popular).slice(0, 6);
    }
    const query = searchQuery.toLowerCase();
    return DESTINATIONS.filter(d => 
      d.name.includes(query) || d.country.includes(query)
    ).slice(0, 8);
  }, [searchQuery]);`;

content = content.replace(targetMemo, replacementMemo);

const targetOnFocus = `onFocus={() => { if (searchQuery.trim().length > 0) setShowSuggestions(true); }}`;
const replacementOnFocus = `onFocus={() => setShowSuggestions(true)}`;

content = content.replace(targetOnFocus, replacementOnFocus);

const targetList = `                    <ul className="py-2">
                      {filteredSuggestions.map((tour, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleSuggestionClick(tour)}
                            className="dropdown-option"
                          >
                            <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                            <span className="font-medium text-body">{tour}</span>
                          </button>
                        </li>
                      ))}
                    </ul>`;

const replacementList = `                    <div className="py-2">
                      {!searchQuery.trim() && (
                        <div className="dropdown-option-group">مقصدهای محبوب</div>
                      )}
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((dest, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(dest.name)}
                            className="dropdown-option"
                          >
                            <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                            <div className="flex flex-col text-right">
                              <span className="font-medium text-body">{dest.name}</span>
                              <span className="text-caption text-text-secondary">{dest.country} · {dest.type}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-4 text-right">
                          <p className="text-body-sm font-medium text-text-heading">مقصدی با این نام پیدا نشد</p>
                          <button className="text-link text-caption mt-2">مشاهده همه مقصدها</button>
                        </div>
                      )}
                    </div>`;

content = content.replace(targetList, replacementList);

fs.writeFileSync('src/components/Hero.tsx', content, 'utf8');
