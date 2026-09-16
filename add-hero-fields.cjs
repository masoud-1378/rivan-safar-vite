const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const targetStr = `                <div className="flex-1 flex items-center gap-2 sm:gap-3 pr-3 sm:pr-4 py-2 sm:py-3 w-full">
                  <MapPin className="w-5 h-5 text-text-secondary shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={isDesktop ? "نام مقصد را وارد کنید؛ مثلا استانبول" : "نام مقصد را وارد کنید"} 
                    className="w-full bg-transparent border-none outline-none text-text-heading placeholder:text-text-secondary/60 text-body-sm"
                  />
                </div>
                <button`;

const replaceStr = `                <div className="flex-[2] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 w-full relative">
                  <MapPin className="w-5 h-5 text-text-secondary shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={isDesktop ? "مقصد یا تور (مثلاً استانبول)" : "نام مقصد..."} 
                    className="w-full bg-transparent border-none outline-none text-text-heading placeholder:text-text-secondary/60 text-body-sm font-medium"
                  />
                </div>
                <div className="hidden sm:block search-divider"></div>
                <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 w-full cursor-pointer hover:bg-surface-secondary/50 transition-colors border-t sm:border-t-0 border-border-default/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span className="text-body-sm font-medium text-text-heading truncate w-full text-right">تاریخ سفر</span>
                </div>
                <div className="hidden sm:block search-divider"></div>
                <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 w-full cursor-pointer hover:bg-surface-secondary/50 transition-colors border-t sm:border-t-0 border-border-default/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span className="text-body-sm font-medium text-text-heading truncate w-full text-right">۱ مسافر</span>
                </div>
                <button`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/Hero.tsx', content, 'utf8');
