import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, Phone } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <span className="badge badge-standard mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>قوانین و مقررات</span>
          </span>
          <h1 className="text-h1 text-text-heading font-extrabold mb-3">
            قوانین و شرایط عمومی خرید تور و خدمات ریوان سفر
          </h1>
          <p className="text-body text-text-secondary leading-relaxed">
            این قوانین بر اساس آئین‌نامه‌های رسمی سازمان هواپیمایی کشوری و وزارت میراث فرهنگی تدوین گردیده و برای کلیه خریداران تور لازم‌الاجرا است.
          </p>
        </div>
      </section>

      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard space-y-6 text-right">
        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-h3 font-bold text-text-heading mb-2">۱. استعلام و عقد قرارداد</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              ثبت فرم‌های درخواست تماس در وب‌سایت به منزله رزرو قطعی نیست. رزرو نهایی منوط به استعلام تایید ظرفیت پرواز و هتل توسط کارشناس، صدور پیش‌فاکتور رسمی و واریز مبلغ پیش‌پرداخت یا تسویه طبق قرارداد است.
            </p>
          </div>

          <div className="border-t border-border-default/60 pt-6">
            <h2 className="text-h3 font-bold text-text-heading mb-2">۲. مدارک شناسایی و گذرنامه</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              مسئولیت صحت اطلاعات هویتی و داشتن حداقل ۷ ماه اعتبار برای گذرنامه در سفرهای خارجی بر عهده مسافر است. هرگونه ممنوع‌الخروجی به عهده شخص مسافر بوده و هزینه‌های مربوط به کنسلی طبق مقررات کسر می‌گردد.
            </p>
          </div>

          <div className="border-t border-border-default/60 pt-6">
            <h2 className="text-h3 font-bold text-text-heading mb-2">۳. شرایط کنسلی و استرداد وجه</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              در صورت انصراف مسافر از سفر، جریمه ابطال بلیط هواپیما بر اساس مقررات شرکت هواپیمایی صادرکننده و جریمه ابطال هتل طبق قوانین هتل کارگزاری محاسبه شده و مابقی وجه مسترد می‌گردد.
            </p>
          </div>

          <div className="border-t border-border-default/60 pt-6">
            <h2 className="text-h3 font-bold text-text-heading mb-2">۴. پشتیبانی در طول سفر</h2>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              ریوان سفر موظف است کلیه خدمات قید شده در واچر (شامل پرواز، اقامت هتل، ترانسفر فرودگاهی و گشت‌های معین) را دقیقا مطابق قرارداد ارائه دهد و در صورت بروز هرگونه مغایرت، بلافاصله نسبت به حل آن اقدام نماید.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
