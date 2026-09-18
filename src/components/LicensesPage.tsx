import React from 'react';
import { Award, ShieldCheck, CheckCircle2, FileText, Phone, ChevronLeft } from 'lucide-react';

interface LicensesPageProps {
  onNavigate: (path: string) => void;
}

export default function LicensesPage({ onNavigate }: LicensesPageProps) {
  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <span className="badge badge-standard mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>مجوزها و اصالت فعالیت</span>
          </span>
          <h1 className="text-h1 text-text-heading font-extrabold mb-3">
            مجوزهای رسمی و تاییدیه‌های قانونی ریوان سفر
          </h1>
          <p className="text-body text-text-secondary leading-relaxed">
            تمامی خدمات گردشگری، فروش بلیط و برگزاری تورهای آژانس ریوان سفر تحت نظارت مراجع ذی‌صلاح کشوری و بر اساس قرارداد رسمی ارائه می‌شود.
          </p>
        </div>
      </section>

      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard space-y-6 text-right">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-bold text-text-heading mb-2">مجوز بند الف</h3>
            <p className="text-caption font-bold text-text-muted mb-3">سازمان هواپیمایی کشوری</p>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
              پروانه رسمی صدور و فروش بلیط کلیه خطوط هوایی داخلی و خارجی و رزرواسیون مستقیم پروازهای برنامه‌ای و چارتری.
            </p>
            <div className="p-3 bg-surface-secondary rounded-control text-caption text-text-heading font-medium">
              ✓ وضعیت: معتبر و دارای پروانه فعالیت رسمی
            </div>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-bold text-text-heading mb-2">مجوز بند ب</h3>
            <p className="text-caption font-bold text-text-muted mb-3">وزارت میراث فرهنگی، گردشگری و صنایع دستی</p>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
              مجوز برنامه‌ریزی، اجرا و فروش تورهای گردشگری سیاحتی، زیارتی، طبیعت‌گردی و تورهای نمایشگاهی بین‌المللی.
            </p>
            <div className="p-3 bg-surface-secondary rounded-control text-caption text-text-heading font-medium">
              ✓ وضعیت: دارای پروانه رسمی اجرای پکیج‌های تور
            </div>
          </div>
        </div>

        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8">
          <h3 className="text-h3 font-bold text-text-heading mb-3">قرارداد معتبر و بیمه مسافرتی</h3>
          <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
            کلیه مسافران ریوان سفر تحت پوشش قرارداد رسمی تیپ سازمان میراث فرهنگی و بیمه‌نامه معتبر بین‌المللی (شامل حوادث، فوریت‌های پزشکی و بار سفر) قرار می‌گیرند.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:02633350139" className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>استعلام و ارتباط با مدیریت: ۰۲۶۳۳۳۵۰۱۳۹</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
