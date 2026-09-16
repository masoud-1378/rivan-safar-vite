import React from 'react';
import { Compass, Home, Phone, Search, ChevronLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl flex items-center justify-center py-16 px-4">
      <div className="bg-surface-primary border border-border-default rounded-card p-8 md:p-12 text-center max-w-lg shadow-card">
        <div className="w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-caption font-mono font-bold text-text-muted">خطای ۴۰۴</span>
        <h1 className="text-h2 font-extrabold text-text-heading mt-1 mb-3">
          صفحه مورد نظر یافت نشد
        </h1>
        <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
          آدرسی که وارد کرده‌اید تغییر کرده یا وجود ندارد. می‌توانید از طریق دکمه‌های زیر به صفحات اصلی دسترسی داشته باشید یا با کارشناسان ما تماس بگیرید.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="btn btn-medium btn-primary text-btn inline-flex items-center justify-center gap-2 font-bold"
          >
            <Home className="w-4 h-4" />
            <span>صفحه اصلی</span>
          </button>
          <button
            onClick={() => onNavigate('/tours')}
            className="btn btn-medium btn-secondary text-btn inline-flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>مشاهده همه تورها</span>
          </button>
        </div>

        <div className="pt-4 border-t border-border-default/60 text-caption text-text-secondary">
          <span>نیاز به راهنمایی دارید؟ تماس با </span>
          <a href="tel:02633350139" className="font-bold text-brand-navy hover:underline" dir="ltr">
            026 - 33350139
          </a>
        </div>
      </div>
    </div>
  );
}
