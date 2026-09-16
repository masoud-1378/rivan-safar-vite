import React, { useState } from 'react';
import { 
  Phone, Calendar, Clock, MapPin, Plane, ShieldCheck, CheckCircle2, 
  XCircle, Building2, User, Send, Check, AlertCircle, HelpCircle, 
  ChevronLeft, Sparkles, FileText, ArrowRight
} from 'lucide-react';
import { SAMPLE_TOURS, TourItem, TOUR_FAQ_ITEMS } from '../data/toursData';

interface TourDetailPageProps {
  tourSlug: string;
  onNavigate: (path: string) => void;
}

export default function TourDetailPage({ tourSlug, onNavigate }: TourDetailPageProps) {
  const tour: TourItem | undefined = SAMPLE_TOURS.find(t => t.id === tourSlug);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passengers: '2',
    hotelPreference: '',
    datePreference: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  if (!tour) {
    return (
      <div className="container-main py-16 px-4 text-center dir-rtl">
        <h2 className="text-h3 font-bold mb-4">تور مورد نظر یافت نشد</h2>
        <button onClick={() => onNavigate('/tours')} className="btn btn-primary btn-medium">
          مشاهده فهرست تورها
        </button>
      </div>
    );
  }

  // Related tours
  const relatedTours = SAMPLE_TOURS.filter(t => t.id !== tour.id && (t.destination === tour.destination || t.type === tour.type)).slice(0, 3);

  const isDomestic = tour.destination === 'کیش' || 
    tour.destination === 'مشهد' || 
    tour.destination === 'قشم' || 
    /ایران|کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار/i.test(tour.title);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-caption text-text-secondary font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-brand-orange transition-colors">
              صفحه اصلی
            </button>
            <span className="text-text-muted">/</span>
            <button onClick={() => onNavigate('/tours')} className="hover:text-brand-orange transition-colors">
              تورها
            </button>
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold truncate max-w-[200px] sm:max-w-none">{tour.title}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Top Hero & Essential Tour Specs ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Main Column: Title, Quick Specs & Price (7 cols) */}
            <div className="lg:col-span-7 text-right">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-standard">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tour.destination}</span>
                </span>
                <span className="badge">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tour.duration}</span>
                </span>
                {tour.badge && (
                  <span className="badge badge-warning font-bold">
                    {tour.badge}
                  </span>
                )}
                {!isDomestic && (
                  !tour.visaRequired ? (
                    <span className="status status-success">بدون ویزا</span>
                  ) : (
                    <span className="status status-warning">نیازمند ویزا</span>
                  )
                )}
              </div>

              {/* Title */}
              <h1 className="text-h1 text-text-heading font-extrabold mb-3 leading-tight">
                {tour.title}
              </h1>

              <p className="text-body text-text-secondary leading-relaxed mb-6">
                {tour.description}
              </p>

              {/* Specifications Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-secondary rounded-card border border-border-default/80 mb-6 text-caption font-medium">
                <div>
                  <span className="text-text-muted block mb-0.5">شهر مبدأ:</span>
                  <span className="text-text-heading font-bold">{tour.origin}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">ایرلاین / حمل‌ونقل:</span>
                  <span className="text-text-heading font-bold">{tour.airline}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">نزدیک‌ترین حرکت:</span>
                  <span className="text-text-heading font-bold">{tour.closestDeparture || 'هفتگی / منظم'}</span>
                </div>
                <div>
                  <span className="text-text-muted block mb-0.5">درجه هتل‌ها:</span>
                  <span className="text-text-heading font-bold">{tour.hotelStars} ستاره و بالاتر</span>
                </div>
              </div>

              {/* Price & Status Card */}
              <div className="p-5 bg-surface-secondary/80 rounded-card border border-border-default mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
                  <div>
                    <span className="text-caption text-text-secondary block mb-1">شروع قیمت پایه:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-h2 font-extrabold text-brand-orange">
                        {tour.formattedPrice}
                      </span>
                      <span className="text-body font-bold text-text-secondary">تومان</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-caption font-bold ${
                      tour.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tour.statusLabel}
                    </span>
                    <div className="text-[11px] text-text-muted mt-1">{tour.updatedAt}</div>
                  </div>
                </div>

                <p className="text-caption text-text-secondary border-t border-border-default/40 pt-2.5">
                  مبنای قیمت: {tour.priceNote}
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:02633350139"
                  className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2.5 font-bold shadow-subtle"
                >
                  <Phone className="w-4 h-4" />
                  <span>تماس و استعلام ظرفیت: ۰۲۶۳۳۳۵۰۱۳۹</span>
                </a>
                <a
                  href="#booking-form"
                  className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-2"
                >
                  <span>ثبت فرم درخواست تماس</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Image (5 cols) */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-card overflow-hidden border border-border-default shadow-card relative">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Guarantee Box */}
              <div className="mt-4 p-4 bg-surface-primary rounded-card border border-border-default text-right space-y-2 text-caption text-text-secondary">
                <div className="flex items-center gap-2 text-text-heading font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تضمین شفافیت خدمات ریوان سفر</span>
                </div>
                <p className="leading-relaxed">
                  تمامی موارد هتل، پرواز، ترانسفر و بیمه در قرارداد رسمی گردشگری به صورت مکتوب قید می‌گردند.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- Hotel Options Table ---------------- */}
      {tour.hotelOptions && tour.hotelOptions.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <div className="text-right mb-6">
            <h2 className="text-h2 text-text-heading font-bold mb-1.5">
              گزینه‌های هتل و قیمت برای هر نفر
            </h2>
            <p className="text-body-sm text-text-secondary">
              امکان انتخاب هتل دلخواه بر اساس بودجه و منطقه اقامت فراهم است.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-body-sm">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border-default text-text-heading font-bold">
                    <th className="py-3.5 px-4 sm:px-6">نام هتل</th>
                    <th className="py-3.5 px-4 text-center">ستاره</th>
                    <th className="py-3.5 px-4 text-center">نوع پذیرایی</th>
                    <th className="py-3.5 px-4 sm:px-6 text-left">قیمت برای هر نفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60">
                  {tour.hotelOptions.map((opt, idx) => (
                    <tr key={idx} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-text-heading">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-text-muted" />
                          <span>{opt.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-caption border border-amber-200">
                          {opt.stars} ستاره
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-text-secondary">
                        {opt.board}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-left font-extrabold text-brand-orange">
                        {opt.pricePerPerson}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Included & Excluded Services ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-standard">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Included Services */}
            <div className="bg-surface-secondary/60 border border-border-default rounded-card p-6 text-right">
              <div className="flex items-center gap-2 text-h3 text-text-heading font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3>خدمات شامل پکیج</h3>
              </div>
              <ul className="space-y-3 text-body-sm text-text-primary font-medium">
                {tour.includedServices.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excluded Services */}
            <div className="bg-surface-secondary/60 border border-border-default rounded-card p-6 text-right">
              <div className="flex items-center gap-2 text-h3 text-text-heading font-bold mb-4">
                <XCircle className="w-5 h-5 text-text-muted" />
                <h3>خدمات غیرشامل (به عهده مسافر)</h3>
              </div>
              <ul className="space-y-3 text-body-sm text-text-secondary">
                {tour.excludedServices.map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0 mt-2"></span>
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- Important Policies (Child, Visa, Cancellation) ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          
          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <h3 className="text-h4 font-bold text-text-heading mb-2">شرایط و مدارک سفر</h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              {isDomestic
                ? 'برای این تور داخلی، همراه داشتن کارت ملی هوشمند و شناسنامه معتبر برای پذیرش پرواز و تحویل اتاق در هتل الزامی است.'
                : tour.visaRequired 
                  ? 'این تور نیازمند ویزا است. مدارک لازم شامل گذرنامه با ۷ ماه اعتبار و مدارک شغلی/تمکن توسط کارشناس اخذ می‌شود.'
                  : 'این مقصد نیازی به اخذ ویزا ندارد. داشتن گذرنامه با حداقل ۶ ماه اعتبار الزامی است.'}
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <h3 className="text-h4 font-bold text-text-heading mb-2">قوانین کودک و تخت اضافه</h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              کودکان زیر ۲ سال (نوزاد) هزینه ناچیز بیمه و پرواز دارند. کودکان ۲ تا ۱۲ سال با تخت یا بدون تخت با تخفیف محاسبه می‌گردند.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <h3 className="text-h4 font-bold text-text-heading mb-2">شرایط تغییر و کنسلی</h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              کنسلی و تغییر تاریخ بر اساس ضوابط سازمان هواپیمایی کشوری و قوانین هتل طرف قرارداد محاسبه شده و در قرارداد رسمی قید می‌شود.
            </p>
          </div>

        </div>
      </section>

      {/* ---------------- Callback Request Form (Strictly "درخواست تماس", never "رزرو") ---------------- */}
      <section id="booking-form" className="bg-surface-primary border-t border-border-default section-standard scroll-mt-12">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-6">
            <span className="badge badge-standard mb-2">پیگیری با کارشناس</span>
            <h3 className="text-h2 text-text-heading font-bold mb-2">ثبت درخواست تماس برای {tour.title}</h3>
            <p className="text-body-sm text-text-secondary">
              نام و شماره تماس خود را وارد کنید. کارشناس تخصصی ریوان سفر جهت بررسی نهایی ظرفیت، پرواز و هتل با شما تماس خواهد گرفت. ثبت این فرم تعهد پرداخت ایجاد نمی‌کند.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center text-emerald-900">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-h4 font-bold mb-2">درخواست تماس شما با موفقیت ثبت شد</h4>
              <p className="text-body-sm text-emerald-800 mb-4">
                کارشناس ریوان سفر در ساعت‌های کاری برای تأیید قیمت و ظرفیت {tour.title} با شما تماس می‌گیرد.
              </p>
              <div className="text-caption text-emerald-700">
                در صورت تمایل می‌توانید مستقیماً با تلفن <a href="tel:02633350139" className="font-bold underline">۰۲۶۳۳۳۵۰۱۳۹</a> تماس حاصل فرمایید.
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-surface-secondary border border-border-default rounded-card p-6 text-right space-y-4">
              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مریم کریمی"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">شماره تلفن همراه <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09123456789"
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading text-right focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">تعداد مسافران</label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="w-full bg-surface-primary border border-border-default rounded-control px-3 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  >
                    <option value="1">۱ نفر (اتاق یک تخته)</option>
                    <option value="2">۲ نفر (اتاق دو تخته)</option>
                    <option value="3">۳ نفر (اتاق سه تخته / کاناپه)</option>
                    <option value="4+">۴ نفر به بالا (خانوادگی / گروهی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-bold text-text-heading mb-1">هتل مد نظر (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.hotelPreference}
                    onChange={(e) => setFormData({ ...formData, hotelPreference: e.target.value })}
                    placeholder="مثال: هتل ۵ ستاره یا نام هتل"
                    className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-text-heading mb-1">توضیحات و نیازمندی‌ها (اختیاری)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: تاریخ ترجیحی حرکت، سن همراهان کودک، درخواست گشت شهری اضافه..."
                  className="w-full bg-surface-primary border border-border-default rounded-control px-4 py-2 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-medium btn-primary w-full text-btn font-bold inline-flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Send className="w-4 h-4" />
                  <span>{formLoading ? 'در حال ارسال درخواست...' : 'ثبت درخواست استعلام قیمت و ظرفیت'}</span>
                </button>
              </div>

              <p className="text-[11px] text-text-secondary text-center">
                این فرم صرفاً ثبت درخواست بررسی کارشناسی است و هیچ‌گونه رزرو قطعی یا پرداخت محسوب نمی‌شود.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---------------- Related Tours ---------------- */}
      {relatedTours.length > 0 && (
        <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
          <h3 className="text-h3 text-text-heading font-bold mb-6 text-right">
            تورهای مشابه پیشنهادی
          </h3>

          <div className="space-y-4">
            {relatedTours.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigate(`/tour/${rel.id}`)}
                className="bg-surface-primary border border-border-default rounded-card p-4 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 text-right"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-control overflow-hidden shrink-0">
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-body font-bold text-text-heading">{rel.title}</h4>
                    <span className="text-caption text-text-secondary">{rel.duration} · {rel.origin}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border-default/40">
                  <div className="text-left">
                    <span className="text-caption text-text-secondary block">شروع قیمت از:</span>
                    <span className="text-body font-extrabold text-brand-orange">{rel.formattedPrice} تومان</span>
                  </div>
                  <span className="btn btn-secondary btn-small text-caption">مشاهده تور</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
