import React from 'react';
import { ShieldCheck, Lock, FileText, Phone } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <span className="badge badge-standard mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>حریم خصوصی</span>
          </span>
          <h1 className="text-h1 text-text-heading font-extrabold mb-3">
            سیاست حفظ حریم خصوصی کاربران ریوان سفر
          </h1>
          <p className="text-body text-text-secondary leading-relaxed">
            ما در ریوان سفر متعهد به محافظت از اطلاعات هویتی، گذرنامه و شماره‌های تماس مسافران و مشتریان محترم هستیم.
          </p>
        </div>
      </section>

      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard space-y-6 text-right">
        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-h3 font-bold text-text-heading mb-2">اطلاعات دریافتی و موارد استفاده</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              اطلاعاتی که در فرم‌های درخواست تماس یا زمان ثبت مدارک ویزا ارسال می‌کنید (مانند نام، شماره تلفن، تصاویر پاسپورت) صرفاً جهت استعلام پرواز، رزرو هتل و امور قانونی سفارتخانه‌ها استفاده می‌شود و به هیچ شخص یا نهاد ثالثی واگذار نخواهد شد.
            </p>
          </div>

          <div className="border-t border-border-default/60 pt-6">
            <h2 className="text-h3 font-bold text-text-heading mb-2">امنیت داده‌ها و مدارک</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              کلیه اسناد و کپی‌های ارسالی با رعایت استانداردهای امنیتی بایگانی و پس از اتمام سفر یا صدور ویزا در صورت درخواست مسافر امحاء یا رمزگذاری می‌گردد.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
