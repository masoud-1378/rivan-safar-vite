import React from 'react';
import { 
  FileText, Clock, ShieldCheck, CheckCircle2, AlertCircle, 
  Phone, Globe, ChevronLeft, MapPin, Sparkles, Building2
} from 'lucide-react';
import { COUNTRIES, Place } from '../data/destinationsData';

interface VisaGuidePageProps {
  countrySlug: string;
  onNavigate: (path: string) => void;
}

export default function VisaGuidePage({ countrySlug, onNavigate }: VisaGuidePageProps) {
  const country: Place | undefined = COUNTRIES[countrySlug];

  const defaultCountry = {
    name: country ? country.name : 'مقصد انتخابی',
    slug: countrySlug,
    visaRequired: country ? country.visaRequired : true,
    visaType: country ? country.visaType : 'ویزای الکترونیکی / برچسبی',
    image: country ? country.image : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
          <nav className="flex items-center gap-2 text-caption text-text-secondary font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-brand-orange transition-colors">
              صفحه اصلی
            </button>
            <span className="text-text-muted">/</span>
            <button onClick={() => onNavigate('/guides')} className="hover:text-brand-orange transition-colors">
              راهنمای سفر و ویزا
            </button>
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold">ویزای {defaultCountry.name}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-warning">
              <FileText className="w-3.5 h-3.5" />
              <span>دپارتمان خدمات ویزا ریوان سفر</span>
            </span>
            {!defaultCountry.visaRequired ? (
              <span className="status status-success">بدون نیاز به ویزا</span>
            ) : (
              <span className="status status-warning">نیازمند ویزا</span>
            )}
          </div>

          <h1 className="text-h1 text-text-heading font-extrabold mb-3">
            راهنمای کامل اخذ ویزای {defaultCountry.name} برای اتباع ایرانی
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-6">
            مراحل، مدارک مورد نیاز، زمان بررسی و هزینه‌های صدور ویزای توریستی و تجاری {defaultCountry.name}. تیم ویزای ریوان سفر کلیه مراحل بارگذاری، تکمیل فرم‌ها و پیگیری سفارت را برای شما انجام می‌دهد.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:02633350139"
              className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2 font-bold"
            >
              <Phone className="w-4 h-4" />
              <span>مشاوره تخصصی ویزا: ۰۲۶۳۳۳۵۰۱۳۹</span>
            </a>
            {country && (
              <button
                onClick={() => onNavigate(`/destination/${country.slug}`)}
                className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-1.5"
              >
                <span>مشاهده تورهای {country.name}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Visa Details & Steps ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard space-y-8 text-right">
        
        {/* Document Checklist */}
        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8">
          <h2 className="text-h2 text-text-heading font-bold mb-4">
            چک‌لیست مدارک مورد نیاز برای ویزای {defaultCountry.name}
          </h2>
          <p className="text-body-sm text-text-secondary mb-6">
            برای جلوگیری از اتلاف وقت و رد درخواست، مدارک زیر را با مشخصات استاندارد آماده کنید:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-surface-secondary rounded-card border border-border-default/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">اصل یا اسکن باکیفیت گذرنامه</h3>
                <p className="text-caption text-text-secondary">گذرنامه باید حداقل ۷ ماه از تاریخ شروع سفر اعتبار داشته و حداقل ۲ صفحه خالی داشته باشد.</p>
              </div>
            </div>

            <div className="p-4 bg-surface-secondary rounded-card border border-border-default/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">عکس پرسنلی بیومتریک جدید</h3>
                <p className="text-caption text-text-secondary">عکس با زمینه سفید، تمام‌رخ، بدون عینک و کلاه، مربوط به ۶ ماه اخیر.</p>
              </div>
            </div>

            <div className="p-4 bg-surface-secondary rounded-card border border-border-default/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">مدارک شغلی و تمکن مالی (در صورت نیاز مقصد)</h3>
                <p className="text-caption text-text-secondary">گواهی اشتغال به کار، پروانه کسب یا گواهی تمکن بانکی لاتین با مهر رسمی بانک.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Workflow */}
        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8">
          <h2 className="text-h2 text-text-heading font-bold mb-4">
            مراحل اخذ ویزا در ریوان سفر
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-extrabold flex items-center justify-center shrink-0">
                ۱
              </div>
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">تحویل یا ارسال آنلاین مدارک</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  مدارک شما توسط کارشناس ویزا بررسی شده و هرگونه نقص یا عدم همخوانی پیش از ارسال اصلاح می‌گردد.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-extrabold flex items-center justify-center shrink-0">
                ۲
              </div>
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">تکمیل فرم‌های رسمی و بارگذاری سفارت</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  فرم‌های رسمی با بالاترین دقت ترجمه و ثبت شده و هزینه‌های کنسولی پرداخت می‌شود.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-extrabold flex items-center justify-center shrink-0">
                ۳
              </div>
              <div>
                <h3 className="text-body font-bold text-text-heading mb-1">دریافت ویزا و تحویل واچر سفر</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  پس از صدور ویزا توسط مراجع قانونی کشور مقصد، نسخه الکترونیکی یا الصاقی به مسافر تحویل می‌گردد.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Prevention Callout */}
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-card text-right">
          <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h3>چگونه از ریجکت شدن ویزا جلوگیری کنیم؟</h3>
          </div>
          <p className="text-body-sm text-amber-950 leading-relaxed">
            بیش از ۸۰ درصد دلایل رد ویزا مربوط به نقص در اسناد، ناهماهنگی تاریخ پرواز با رزرو هتل یا عدم شفافیت هدف سفر است. تیم مجرب ریوان سفر با بازبینی دقیق پرونده، ضریب موفقیت اخذ ویزا را به حداکثر می‌رساند.
          </p>
        </div>

      </section>
    </div>
  );
}
