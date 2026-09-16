const fs = require('fs');
let content = fs.readFileSync('src/components/ToursPage.tsx', 'utf8');

const targetForm = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">\s*<input\s*type="text"\s*required\s*placeholder="نام و نام خانوادگی"\s*value=\{bookingForm.name\}\s*onChange=\{\(e\) => setBookingForm\(\{\.\.\.bookingForm, name: e\.target\.value\}\)\}\s*className="form-input !bg-white\/10 !border-white\/20 !text-white placeholder:!text-white\/50 focus:!border-brand-orange"\s*\/>\s*<input\s*type="tel"\s*required\s*placeholder="شماره موبایل \(مثال: ۰۹۱۲\.\.\.\)"\s*value=\{bookingForm.mobile\}\s*onChange=\{\(e\) => setBookingForm\(\{\.\.\.bookingForm, mobile: e\.target\.value\}\)\}\s*className="form-input !bg-white\/10 !border-white\/20 !text-white placeholder:!text-white\/50 focus:!border-brand-orange"\s*\/>\s*<\/div>/;

const replacementForm = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-field">
                    <label className="form-label form-label-required !text-white">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      required
                      placeholder="مثلاً علی احمدی" 
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                      className="form-input !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 focus:!border-brand-orange"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required !text-white">شماره موبایل</label>
                    <input 
                      type="tel" 
                      required
                      dir="ltr"
                      placeholder="مثلاً 09123456789" 
                      value={bookingForm.mobile}
                      onChange={(e) => setBookingForm({...bookingForm, mobile: e.target.value})}
                      className="form-input !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 focus:!border-brand-orange text-left"
                    />
                  </div>
                </div>`;

content = content.replace(targetForm, replacementForm);
fs.writeFileSync('src/components/ToursPage.tsx', content, 'utf8');
