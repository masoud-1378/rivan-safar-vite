import React from 'react';
import { 
  Building2, ShieldCheck, Award, Users, Phone, MapPin, 
  Clock, CheckCircle2, ChevronLeft, Globe 
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <span className="badge badge-standard mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>درباره ریوان سفر البرز</span>
          </span>
          <h1 className="text-h1 text-text-heading font-extrabold mb-4">
            آژانس مسافرتی و گردشگری ریوان سفر
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-6">
            شرکت خدمات مسافرت هوایی و گردشگری ریوان سفر با مجوزهای رسمی بند الف (سازمان هواپیمایی کشوری) و بند ب (وزارت میراث فرهنگی، گردشگری و صنایع دستی)، مجری مستقیم تورهای گردشگری، سفرهای زیارتی و تورهای تخصصی نمایشگاهی بین‌المللی است.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/licenses')}
              className="btn btn-medium btn-secondary text-btn inline-flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>مشاهده مجوزها و پروانه‌ها</span>
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="btn btn-medium btn-primary text-btn inline-flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>راه‌های ارتباط و آدرس دفتر</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- Core Values & Commitments ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl section-standard space-y-8 text-right">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">شفافیت کامل در قیمت‌گذاری</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              تمام مبالغ، جزئیات اتاق‌ها، نوع خط هوایی و خدمات شامل و غیرشامل به صورت رسمی و کتبی در قرارداد گردشگری منعکس می‌گردد.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">همراهی کارشناس در طول سفر</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              مسافران ما در تمام طول سفر در صورت بروز هرگونه مشکل در پرواز، ترانسفر یا هتل، دسترسی مستقیم به پشتیبان دارند.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-default rounded-card p-6">
            <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-h4 font-bold text-text-heading mb-2">تخصص در سفرهای تجاری</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              ریوان سفر تورهای نمایشگاهی بین‌المللی نظیر Canton Fair چین و Gulfood دبی را برای هیئت‌های بازرگانی اجرا می‌کند.
            </p>
          </div>
        </div>

        {/* Agency Identity & Physical Info */}
        <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8">
          <h2 className="text-h2 text-text-heading font-bold mb-4">اطلاعات هویتی و ثبتی شرکت</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm text-text-secondary">
            <div>
              <span className="font-bold text-text-heading block mb-1">نام کامل حقوقی:</span>
              <span>شرکت خدمات مسافرت هوایی و گردشگری ریوان سفر البرز</span>
            </div>
            <div>
              <span className="font-bold text-text-heading block mb-1">نوع فعالیت:</span>
              <span>بند الف (فروش بلیط پرواز) و بند ب (برگزاری تورهای داخلی و بین‌المللی)</span>
            </div>
            <div>
              <span className="font-bold text-text-heading block mb-1">دفتر مرکزی:</span>
              <span>کرج، گوهردشت، بلوار مطهری</span>
            </div>
            <div>
              <span className="font-bold text-text-heading block mb-1">تلفن تماس:</span>
              <span dir="ltr" className="font-mono font-bold text-text-heading">026-33350139</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
