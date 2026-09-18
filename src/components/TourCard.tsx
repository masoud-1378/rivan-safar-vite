import React, { type ReactNode } from 'react';
import { Plane, Car, Building2, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export interface TourCardProps {
  key?: React.Key;
  id?: string | number;
  title: string;
  image: string;
  duration?: string; // e.g. "۳ شب و ۴ روز"
  country?: string; // e.g. "ترکیه"
  destination?: string;
  badge?: string;
  meta?: string;
  origin?: string;
  season?: string;
  price?: string;
  isDomestic?: boolean;
  hotelStars?: number | string; // e.g. 4 or "۴★"
  hasTransfer?: boolean;
  hasFlight?: boolean;
  visaFree?: boolean;
  visaRequired?: boolean;
  limited?: boolean;
  pricePending?: boolean;
  soldOut?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function TourCard({
  title,
  image,
  duration = '۳ شب و ۴ روز',
  country,
  destination,
  badge,
  meta,
  origin,
  season,
  price,
  isDomestic: isDomesticProp,
  hotelStars = 4,
  hasTransfer = true,
  hasFlight = true,
  visaFree,
  visaRequired,
  limited = false,
  pricePending = false,
  soldOut = false,
  href = '#tour-details',
  onClick,
  className = '',
}: TourCardProps) {

  // Infer destination / country if not explicitly provided
  const inferredCountry = country || (
    /استانبول|آنتالیا|ترکیه|وان|کوش آداسی|مارماریس/i.test(title) ? 'ترکیه' :
    /دبی|امارات/i.test(title) ? 'امارات' :
    /فرانسه|پاریس|ایتالیا|رم|اروپا/i.test(title) ? 'فرانسه' :
    /ژاپن|توکیو/i.test(title) ? 'ژاپن' :
    /چین|پکن|شانگهای|گوانگجو/i.test(title) ? 'چین' :
    /آلمان/i.test(title) ? 'آلمان' :
    /کیش|مشهد|قشم|شیراز|اصفهان|ایران|چابهار|یزد|تبریز/i.test(title) ? 'ایران' :
    (destination || 'ترکیه')
  );

  // Check if tour is domestic (داخل کشور)
  const isDomestic = isDomesticProp !== undefined 
    ? isDomesticProp 
    : (
      inferredCountry === 'ایران' || 
      /ایران|کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار|سرعین|گیلان|مازندران|لرستان|همدان/i.test(title) ||
      /ایران|کیش|مشهد|قشم/i.test(destination || '')
    );

  // Status badge overlay
  let effectiveBadge = badge;
  if (effectiveBadge === 'بدون ویزا') {
    effectiveBadge = undefined;
  }
  if (soldOut) {
    effectiveBadge = 'تکمیل ظرفیت';
  } else if (limited) {
    effectiveBadge = 'ظرفیت محدود';
  }

  // Visa requirement logic
  const isVisaKeywordInTitle = /ژاپن|آلمان|فرانسه|اسپانیا|چین|دبی|اروپا|شینگن|کانادا|انگلیس|رم|پاریس/i.test(title);
  const requiresVisa = visaRequired !== undefined 
    ? visaRequired 
    : (visaFree !== undefined ? !visaFree : isVisaKeywordInTitle);

  // Format hotel stars label (e.g. هتل ۴★)
  const hotelLabel = typeof hotelStars === 'string' && hotelStars.includes('★')
    ? hotelStars
    : `هتل ${hotelStars}★`;

  const CardWrapper = ({ children }: { children: ReactNode }) => {
    const baseClasses = `group bg-surface-primary border border-border-default rounded-[18px] shadow-subtle hover:shadow-card hover:border-border-brand/40 transition-all duration-300 flex flex-col overflow-hidden h-full cursor-pointer hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${soldOut ? 'opacity-85' : ''} ${className}`;
    
    if (onClick) {
      return (
        <div onClick={onClick} className={baseClasses} role="button" tabIndex={0}>
          {children}
        </div>
      );
    }
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  };

  return (
    <CardWrapper>
      {/* 1. Card Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-page-background shrink-0">
        <img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'grayscale-[50%]' : ''}`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        {effectiveBadge && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`backdrop-blur-md shadow-subtle text-[11.5px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${
              soldOut 
                ? 'bg-surface-dark/90 text-white' 
                : limited
                ? 'bg-amber-500/90 text-white'
                : 'bg-surface-primary/95 text-brand-orange border border-white/20'
            }`}>
              <span>{effectiveBadge}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow text-center dir-rtl">
        <div>
          {/* Main Orange Tour Title */}
          <h3 
            title={title}
            className="text-[16.5px] sm:text-[17.5px] font-bold text-brand-orange tracking-normal mb-1.5 group-hover:opacity-90 transition-opacity [text-wrap:balance]"
          >
            {title}
          </h3>

          {/* Subtitle: Duration | Country with MapPin icon */}
          <div className="flex items-center justify-center gap-1.5 text-text-secondary text-[13px] sm:text-[14px] font-medium mb-4">
            <span className="text-text-primary font-semibold">{duration}</span>
            <span className="text-border-default/80 mx-1">|</span>
            <span>{inferredCountry}</span>
            <MapPin className="w-3.5 h-3.5 text-text-secondary/70 shrink-0" />
          </div>

          {/* Features Capsule Pill (Exact design from user screenshot: Flight + Transfer + Hotel + Visa) */}
          <div className="w-full bg-[#f8fafc] border border-border-default/70 rounded-2xl py-2.5 px-3 flex items-center justify-between text-text-heading shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] mb-4">
            
            {/* 1. Flight (پرواز) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Plane className="w-4 h-4 text-text-heading stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-text-heading">پرواز</span>
            </div>

            <span className="text-border-default/90 text-[13px] font-light shrink-0 select-none">+</span>

            {/* 2. Transfer (ترنسفر) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Car className="w-4 h-4 text-text-heading stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-text-heading">ترنسفر</span>
            </div>

            <span className="text-border-default/90 text-[13px] font-light shrink-0 select-none">+</span>

            {/* 3. Hotel (هتل ۴★) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Building2 className="w-4 h-4 text-text-heading stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-text-heading whitespace-nowrap">{hotelLabel}</span>
            </div>

            {/* 4. Visa (ویزا / بدون ویزا) - فقط برای تورهای خارجی */}
            {!isDomestic && (
              <>
                <span className="text-border-default/90 text-[13px] font-light shrink-0 select-none">+</span>
                <div className="flex flex-col items-center justify-center gap-1 flex-1">
                  <ShieldCheck className="w-4 h-4 text-text-heading stroke-[1.8]" />
                  <span className="text-[11.5px] sm:text-[12px] font-bold text-text-heading whitespace-nowrap">
                    {requiresVisa ? 'ویزا' : 'بدون ویزا'}
                  </span>
                </div>
              </>
            )}

          </div>
        </div>

        {/* 3. Footer Block - Price Row */}
        <div className="mt-auto pt-3 border-t border-border-default/60 flex items-center justify-between gap-2 text-right">
          {soldOut ? (
            <>
              <span className="text-body-sm text-text-secondary font-medium">وضعیت تور</span>
              <span className="text-body-sm font-bold text-text-secondary">تکمیل ظرفیت</span>
            </>
          ) : pricePending ? (
            <>
              <span className="text-body-sm text-text-secondary font-medium">وضعیت قیمت</span>
              <span className="text-body-sm font-bold text-brand-orange">قیمت در حال بررسی</span>
            </>
          ) : price ? (
            <>
              <span className="text-[12px] sm:text-[13px] text-text-secondary font-medium shrink-0">شروع قیمت از</span>
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-body-lg sm:text-h4 font-black text-brand-orange">{price}</span>
                <span className="text-[11px] text-text-secondary font-medium">تومان</span>
              </div>
            </>
          ) : (
            <>
              <span className="text-body-sm text-text-secondary font-medium">استعلام قیمت</span>
              <span className="text-body-sm font-bold text-brand-orange">تماس بگیرید</span>
            </>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

