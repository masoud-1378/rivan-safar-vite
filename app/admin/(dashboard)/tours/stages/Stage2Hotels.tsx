'use client';

import React from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Star, 
  UtensilsCrossed, 
  Users, 
  User, 
  Baby, 
  Info,
  DollarSign
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TourHotelOptionItem, TourInput } from '../actions';

interface Stage2HotelsProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

const BOARD_OPTIONS = [
  { value: 'BB', label: 'BB (صبحانه بوفه)' },
  { value: 'HB', label: 'HB (صبحانه + ناهار یا شام)' },
  { value: 'FB', label: 'FB (صبحانه، ناهار و شام کامل)' },
  { value: 'ALL', label: 'ALL (تمامی وعده‌ها و نوشیدنی‌ها تا ساعت ۲۳)' },
  { value: 'UALL', label: 'UALL (سرویس ۲۴ ساعته نامحدود)' },
  { value: 'RO', label: 'RO (فقط اتاق بدون پذیرایی)' },
];

export default function Stage2Hotels({ data, onChange }: Stage2HotelsProps) {
  const hotels: TourHotelOptionItem[] = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];

  const handleAddHotel = () => {
    const next: TourHotelOptionItem[] = [
      ...hotels,
      {
        name: '',
        stars: 4,
        board: 'BB',
        pricePerPerson: '',
        priceDouble: '',
        priceSingle: '',
        priceChildWithBed: '',
        priceChildNoBed: '',
        locationNote: '',
      },
    ];
    onChange({ hotelOptions: next });
  };

  const handleUpdateHotel = (index: number, patch: Partial<TourHotelOptionItem>) => {
    const next = [...hotels];
    next[index] = { ...next[index], ...patch };
    onChange({ hotelOptions: next });
  };

  const handleRemoveHotel = (index: number) => {
    const next = hotels.filter((_, i) => i !== index);
    onChange({ hotelOptions: next });
  };

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله دوم: ماتریس هتل‌ها و ظرفیت اتاق‌ها</h3>
            <p className="text-xs text-muted-foreground">
              تعریف پکیج‌های اقامتی، ستاره هتل، رژیم غذایی (BB, ALL, FB) و تفکیک شفاف قیمت اتاق ۲تخته، ۱تخته و کودکان
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddHotel}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
        >
          <Plus className="size-4" />
          افزودن هتل جدید
        </Button>
      </div>

      {hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-10 text-center">
          <Building2 className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground mb-1">هنوز هتلی برای این تور ثبت نشده است</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            با افزودن هتل‌های مختلف (۳ ستاره اقتصادی تا ۵ ستاره لوکس)، به مسافر حق انتخاب شفاف بر اساس بودجه می‌دهید.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddHotel}
            className="gap-2 text-xs"
          >
            <Plus className="size-4" />
            افزودن اولین هتل
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {hotels.map((hotel, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 transition-all hover:border-border/80"
            >
              {/* Hotel header line */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {hotel.name ? `هتل ${hotel.name}` : `پکیج اقامتی شماره ${idx + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHotel(idx)}
                  className="inline-flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="size-4" />
                  حذف هتل
                </button>
              </div>

              {/* Basic Hotel Specs: Name, Stars, Board */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <Field label="نام کامل هتل *" hint="مثال: Hilton Bosphorus Istanbul">
                    <Input
                      value={hotel.name || ''}
                      onChange={(e) => handleUpdateHotel(idx, { name: e.target.value })}
                      placeholder="نام هتل…"
                    />
                  </Field>
                </div>

                <div className="md:col-span-3">
                  <Field label="درجه / ستاره">
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => handleUpdateHotel(idx, { stars: star })}
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg border transition-colors",
                            (hotel.stars || 3) >= star
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                              : "bg-secondary/30 border-border/60 text-muted-foreground"
                          )}
                          title={`${star} ستاره`}
                        >
                          <Star className={cn("size-4", (hotel.stars || 3) >= star ? "fill-amber-500" : "")} />
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="md:col-span-4">
                  <Field label="خدمات غذایی (Board)">
                    <select
                      value={hotel.board || 'BB'}
                      onChange={(e) => handleUpdateHotel(idx, { board: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
                    >
                      {BOARD_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Detailed Pricing Grid by Room Type */}
              <div className="rounded-xl bg-secondary/20 p-4 border border-border/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <DollarSign className="size-4 text-emerald-500" />
                  <span>جدول تفکیک نرخ هر اتاق (تومان یا ارز)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Double Room */}
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                      <Users className="size-3.5 text-blue-500" />
                      <span>اتاق ۲ تخته (Double) *</span>
                    </div>
                    <Input
                      value={hotel.priceDouble || hotel.pricePerPerson || ''}
                      onChange={(e) => handleUpdateHotel(idx, { 
                        priceDouble: e.target.value,
                        pricePerPerson: e.target.value 
                      })}
                      placeholder="مثلاً: 38,500,000 تومان"
                      className="text-xs h-8"
                    />
                  </div>

                  {/* Single Room */}
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                      <User className="size-3.5 text-purple-500" />
                      <span>اتاق ۱ تخته (Single)</span>
                    </div>
                    <Input
                      value={hotel.priceSingle || ''}
                      onChange={(e) => handleUpdateHotel(idx, { priceSingle: e.target.value })}
                      placeholder="مثلاً: 49,000,000 تومان"
                      className="text-xs h-8"
                    />
                  </div>

                  {/* Child with bed */}
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                      <Baby className="size-3.5 text-amber-500" />
                      <span>کودک با تخت (۶ تا ۱۲ سال)</span>
                    </div>
                    <Input
                      value={hotel.priceChildWithBed || ''}
                      onChange={(e) => handleUpdateHotel(idx, { priceChildWithBed: e.target.value })}
                      placeholder="مثلاً: 29,000,000 تومان"
                      className="text-xs h-8"
                    />
                  </div>

                  {/* Child without bed */}
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                      <Baby className="size-3.5 text-teal-500" />
                      <span>کودک بدون تخت (۲ تا ۶ سال)</span>
                    </div>
                    <Input
                      value={hotel.priceChildNoBed || ''}
                      onChange={(e) => handleUpdateHotel(idx, { priceChildNoBed: e.target.value })}
                      placeholder="مثلاً: 19,000,000 تومان"
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Transfer note */}
              <Field label="موقعیت هتل یا نکته ترانسفر" hint="مثال: واقع در میدان تقسیم، فاصله ۵ دقیقه تا مترو، دارای استخر روباز">
                <Input
                  value={hotel.locationNote || ''}
                  onChange={(e) => handleUpdateHotel(idx, { locationNote: e.target.value })}
                  placeholder="فاصله تا مراکز مهم یا ویژگی ممتاز هتل…"
                  className="text-xs"
                />
              </Field>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
