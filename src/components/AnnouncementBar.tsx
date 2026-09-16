import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface AnnouncementBarProps {
  onClose?: () => void;
}

export default function AnnouncementBar({ onClose }: AnnouncementBarProps) {
  return (
    <div 
      className="w-full bg-surface-dark text-white text-body-sm font-medium leading-[1.5] h-[38px] md:h-[34px] flex items-center  relative z-[51] select-none shadow-subtle transition-all duration-300"
      dir="rtl"
    >
      <div className="container-main px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between relative">
        
        {/* Mobile Layout (sm and below) */}
        <div className="flex md:hidden items-center justify-center flex-1 text-center pr-2 pl-2">
          <span className="text-white/90 flex items-center justify-center gap-1.5 flex-wrap">
            تورهای نوروزی 1406
            <a 
              href="#destinations" 
              className="inline-flex items-center gap-1 text-brand-orange font-bold border-b border-brand-orange/40 hover:border-brand-orange hover:text-brand-orange-soft transition-all pb-[1px]"
            >
              مشاهده تورها
              <ArrowLeft className="w-3 h-3" />
            </a>
          </span>
        </div>

        {/* Desktop Layout (md and up) */}
        {/* Right side spacer for flex symmetry in RTL */}
        <div className="hidden md:block w-48 shrink-0" aria-hidden="true" />

        {/* Center Text */}
        <div className="hidden md:flex items-center justify-center flex-1 text-center">
          <span className="text-white/95 flex items-center justify-center gap-2">
            ثبت‌نام تورهای نوروزی آغاز شد.
            <a 
              href="#destinations" 
              className="inline-flex items-center gap-1 text-brand-orange font-bold border-b border-brand-orange/40 hover:border-brand-orange hover:text-brand-orange-soft transition-all pb-[1px]"
            >
              مشاهده تورها
              <ArrowLeft className="w-3.5 h-3.5" />
            </a>
          </span>
        </div>

        {/* Left Side: Working Hours */}
        <div className="hidden md:flex items-center justify-end text-white/85 text-caption md:text-body-sm w-48 shrink-0 pl-10">
          <span>پاسخگویی امروز: ۹ تا ۲۱</span>
        </div>

        {/* Close Icon Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-small transition-colors text-white/80 hover:text-white shrink-0"
            title="بستن"
            aria-label="بستن اطلاع‌رسانی"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
