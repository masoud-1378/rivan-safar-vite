import React, { type ReactNode } from 'react';
import SmartImage from './SmartImage';
import { Plane, Car, Building2, ShieldCheck, MapPin, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // Format hotel stars label
  const hotelLabel = typeof hotelStars === 'string' && hotelStars.includes('★')
    ? hotelStars
    : `هتل ${hotelStars}★`;

  const CardWrapper = ({ children }: { children: ReactNode }) => {
    const baseClasses = cn(
      "group bg-card border border-border rounded-[20px] shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden h-full cursor-pointer hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      soldOut && "opacity-85",
      className
    );
    
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
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted shrink-0">
        <SmartImage
          src={image}
          alt={title}
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            soldOut && "grayscale-[50%]"
          )}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Status Badges */}
        {effectiveBadge && (
          <div className="absolute top-3 start-3 z-10">
            <span className={cn(
              "backdrop-blur-md text-[11.5px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm inline-flex items-center",
              soldOut 
                ? "bg-secondary/90 text-secondary-foreground" 
                : limited
                ? "bg-warning/90 text-black"
                : "bg-background/95 text-primary border border-border"
            )}>
              {effectiveBadge}
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow text-center">
        <div>
          {/* Main Tour Title */}
          <h3 
            title={title}
            className="text-[16.5px] sm:text-[17.5px] font-bold text-foreground group-hover:text-primary transition-colors mb-1.5 [text-wrap:balance]"
          >
            {title}
          </h3>

          {/* Subtitle: Duration | Country with MapPin icon */}
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-[13px] sm:text-[14px] font-medium mb-4">
            <span className="text-foreground font-semibold">{duration}</span>
            <span className="text-border mx-1">|</span>
            <span>{inferredCountry}</span>
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          </div>

          {/* Features Capsule Pill */}
          <div className="w-full bg-muted/60 border border-border/70 rounded-2xl py-2.5 px-3 flex items-center justify-between text-foreground mb-4">
            
            {/* 1. Flight (پرواز) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Plane className="w-4 h-4 text-foreground stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold">پرواز</span>
            </div>

            <span className="text-border text-[13px] font-light shrink-0 select-none">+</span>

            {/* 2. Transfer (ترنسفر) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Car className="w-4 h-4 text-foreground stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold">ترنسفر</span>
            </div>

            <span className="text-border text-[13px] font-light shrink-0 select-none">+</span>

            {/* 3. Hotel (هتل ۴★) */}
            <div className="flex flex-col items-center justify-center gap-1 flex-1">
              <Building2 className="w-4 h-4 text-foreground stroke-[1.8]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold whitespace-nowrap">{hotelLabel}</span>
            </div>

            {/* 4. Visa (ویزا / بدون ویزا) */}
            {!isDomestic && (
              <>
                <span className="text-border text-[13px] font-light shrink-0 select-none">+</span>
                <div className="flex flex-col items-center justify-center gap-1 flex-1">
                  <ShieldCheck className="w-4 h-4 text-foreground stroke-[1.8]" />
                  <span className="text-[11.5px] sm:text-[12px] font-bold whitespace-nowrap">
                    {requiresVisa ? 'ویزا' : 'بدون ویزا'}
                  </span>
                </div>
              </>
            )}

          </div>
        </div>

        {/* 3. Footer Block - Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-border/70 flex items-center justify-between gap-2 text-start">
          {soldOut ? (
            <>
              <span className="text-xs text-muted-foreground font-medium">وضعیت تور</span>
              <Badge variant="secondary" className="font-bold">تکمیل ظرفیت</Badge>
            </>
          ) : pricePending ? (
            <>
              <span className="text-xs text-muted-foreground font-medium">وضعیت قیمت</span>
              <span className="text-xs sm:text-sm font-bold text-primary">قیمت در حال بررسی</span>
            </>
          ) : price ? (
            <>
              <div className="flex flex-col text-start">
                <span className="text-[11px] sm:text-[12px] text-muted-foreground font-medium">شروع قیمت از</span>
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-base sm:text-lg font-black text-primary">{price}</span>
                  <span className="text-[11px] text-muted-foreground font-medium">تومان</span>
                </div>
              </div>
              <Button size="sm" variant="brand" className="rounded-xl px-3 font-medium text-xs">
                جزئیات تور
                <ChevronLeft className="w-3.5 h-3.5 ms-0.5" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground font-medium">استعلام قیمت</span>
              <span className="text-xs sm:text-sm font-bold text-primary">تماس بگیرید</span>
            </>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
