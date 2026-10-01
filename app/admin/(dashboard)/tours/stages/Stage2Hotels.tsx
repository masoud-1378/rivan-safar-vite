'use client';

import React, { useRef, useState } from 'react';
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
  DollarSign,
  Search,
  Check,
  Unlink
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { normalizeFaSearch } from '@/lib/persian';
import type { HotelBookingType, TourHotelOptionItem, TourInput } from '../actions';
import type { HotelPickerItem } from '../../hotels/actions';

interface Stage2HotelsProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  hotels: HotelPickerItem[];
}

const BOARD_OPTIONS = [
  { value: 'BB', label: 'صبحانه بوفه (BB)' },
  { value: 'HB', label: 'صبحانه + ناهار یا شام (HB)' },
  { value: 'FB', label: 'صبحانه، ناهار و شام کامل (FB)' },
  { value: 'ALL', label: 'تمامی وعده‌ها و نوشیدنی‌ها تا ساعت ۲۳ (ALL)' },
  { value: 'UALL', label: 'سرویس ۲۴ ساعته نامحدود (UALL)' },
  { value: 'RO', label: 'فقط اتاق بدون پذیرایی (RO)' },
];

// کتابچه §۳ (فاز ۲، قلم ۷): سه نوع رزرو — هر کدام زیرفیلد نرخ خودش را نشان می‌دهد.
// مقدار ذخیره‌شده کد لاتین است؛ برچسب فارسی در UI.
const BOOKING_TYPE_OPTIONS: Array<{ value: HotelBookingType; label: string }> = [
  { value: 'guarantee', label: 'گارانتی' },
  { value: 'semi_charter', label: 'نیم‌چارتر' },
  { value: 'on_request', label: 'درخواستی' },
];

export default function Stage2Hotels({ data, onChange, hotels: catalogHotels }: Stage2HotelsProps) {
  const hotels: TourHotelOptionItem[] = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];
  const [showHotelPicker, setShowHotelPicker] = useState(false);
  const [hotelQuery, setHotelQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // گشت (ایراد ۵): باز شدن پنل باید غیرقابل‌چشم‌پوشی باشد — دکمه حالت فعال می‌گیرد،
  // پنل به دید اسکرول می‌شود و جست‌وجو فوکوس می‌گیرد تا «هیچ اتفاقی نیفتاد» تکرار نشود.
  const toggleHotelPicker = () => {
    const next = !showHotelPicker;
    setShowHotelPicker(next);
    if (next) {
      requestAnimationFrame(() => {
        pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        pickerRef.current?.querySelector('input')?.focus({ preventScroll: true });
      });
    }
  };

  const handleAddHotel = () => {
    const next: TourHotelOptionItem[] = [
      ...hotels,
      {
        name: '',
        // ستاره عمداً خالی می‌ماند تا مدیر آگاهانه انتخاب کند (ادعای ستاره نباید حدسی باشد)
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

  // افزودن هتل از جدول ثبت‌شده‌ها: نام و ستاره از رکورد می‌آید، قیمت همان‌جا دستی وارد می‌شود (ویژهٔ این تور)
  // اگر کاتالوگ برای هتل ستاره ثبت نکرده باشد، ستاره خالی می‌ماند — هرگز حدس زده نمی‌شود.
  const handleAddHotelFromTable = (h: HotelPickerItem) => {
    const next: TourHotelOptionItem[] = [
      ...hotels,
      {
        hotelId: h.id,
        name: h.nameFa,
        ...(h.stars ? { stars: h.stars } : {}),
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
    setShowHotelPicker(false);
    setHotelQuery('');
  };

  const handleUnlinkHotel = (index: number) => {
    const next = hotels.map((h, i) => {
      if (i !== index) return h;
      const { hotelId: _dropped, ...rest } = h;
      return rest;
    });
    onChange({ hotelOptions: next });
  };

  const catalogQuery = normalizeFaSearch(hotelQuery);
  const catalogResults = catalogQuery
    ? catalogHotels.filter((h) => normalizeFaSearch(h.nameFa).includes(catalogQuery)).slice(0, 30)
    : catalogHotels.slice(0, 30);

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
              تعریف پکیج‌های اقامتی، ستاره هتل، نوع پذیرایی (صبحانه بوفه، همه‌چیز شامل و…) و تفکیک شفاف قیمت اتاق ۲تخته، ۱تخته و کودکان
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={toggleHotelPicker}
            aria-expanded={showHotelPicker}
            className={cn('gap-2 text-xs h-9', showHotelPicker && 'border-brand bg-brand/10 text-foreground')}
          >
            <Search className="size-4" />
            {showHotelPicker ? 'بستن فهرست هتل‌ها' : 'انتخاب از هتل‌های ثبت‌شده'}
          </Button>
          <Button
            type="button"
            onClick={handleAddHotel}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
          >
            <Plus className="size-4" />
            افزودن هتل جدید
          </Button>
        </div>
      </div>

      {/* انتخاب هتل از جدول ثبت‌شده‌ها: نام و ستاره از رکورد پر می‌شود؛ قیمت همان‌جا دستی (ویژهٔ این تور) */}
      {showHotelPicker && (
        <div ref={pickerRef} className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="relative">
            <Input
              value={hotelQuery}
              onChange={(e) => setHotelQuery(e.target.value)}
              placeholder="نام هتل را بنویسید…"
              className="ps-9 text-xs"
            />
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          </div>
          {catalogHotels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              هنوز هتلی در جدول ثبت نشده است؛ از «افزودن هتل جدید» به‌صورت دستی وارد کنید.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
              {catalogResults.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">چیزی پیدا نشد.</p>
              ) : (
                catalogResults.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleAddHotelFromTable(h)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-xs transition-colors hover:bg-accent/40 min-h-11"
                  >
                    <span className="flex items-center gap-2 text-foreground">
                      <Building2 className="size-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium">{h.nameFa}</span>
                      {h.cityName ? (
                        <span className="text-[10px] text-muted-foreground">({h.cityName})</span>
                      ) : null}
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Star className="size-3 text-amber-500 fill-amber-500" />
                        {h.stars ?? '—'}
                      </span>
                    </span>
                    <Plus className="size-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

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
                  {hotel.hotelId && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="size-3" />
                      متصل به جدول هتل‌ها
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {hotel.hotelId && (
                    <button
                      type="button"
                      onClick={() => handleUnlinkHotel(idx)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="نام و ستاره دستی می‌ماند؛ فقط اتصال به جدول قطع می‌شود"
                    >
                      <Unlink className="size-4" />
                      جدا کردن
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveHotel(idx)}
                    className="inline-flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="size-4" />
                    حذف هتل
                  </button>
                </div>
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
                            (hotel.stars ?? 0) >= star
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                              : "bg-secondary/30 border-border/60 text-muted-foreground"
                          )}
                          title={`${star} ستاره`}
                        >
                          <Star className={cn("size-4", (hotel.stars ?? 0) >= star ? "fill-amber-500" : "")} />
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="md:col-span-4">
                  <Field label="خدمات غذایی">
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

              {/* نرخ رزرو — کتابچه §۳ (فاز ۲، قلم ۷): «نوع رزرو» راهنمای ترتیب فیلدهاست؛
                  هر نوع، زیرفیلد نرخ خودش را نشان می‌دهد و در pricePerPerson می‌نشیند (همان فیلدی که سایت می‌خواند). */}
              <div className="rounded-xl bg-secondary/20 p-4 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <DollarSign className="size-4 text-emerald-500" />
                    <span>نرخ رزرو</span>
                  </div>
                  {hotel.hotelId && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">ویژهٔ این تور</span>
                  )}
                </div>

                <Field label="نوع رزرو">
                  <select
                    value={hotel.bookingType ?? ''}
                    onChange={(e) => handleUpdateHotel(idx, { bookingType: (e.target.value || undefined) as HotelBookingType | undefined })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
                    aria-label="نوع رزرو هتل"
                  >
                    <option value="">انتخاب کنید…</option>
                    {BOOKING_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {hotel.bookingType === 'guarantee' && (
                  <Field label="نرخ گارانتی (هر نفر، تومان)" hint="نرخی که هتل به‌صورت گارانتی اعلام کرده؛ همین عدد روی سایت نمایش داده می‌شود.">
                    <Input
                      value={hotel.pricePerPerson || ''}
                      onChange={(e) => handleUpdateHotel(idx, { pricePerPerson: e.target.value })}
                      placeholder="مثلاً: 38,500,000"
                      className="text-xs h-8"
                      inputMode="numeric"
                    />
                  </Field>
                )}
                {hotel.bookingType === 'semi_charter' && (
                  <Field label="نرخ نیم‌چارتر (هر نفر، تومان)" hint="نرخ نیم‌چارتر این هتل برای همین تور؛ همین عدد روی سایت نمایش داده می‌شود.">
                    <Input
                      value={hotel.pricePerPerson || ''}
                      onChange={(e) => handleUpdateHotel(idx, { pricePerPerson: e.target.value })}
                      placeholder="مثلاً: 38,500,000"
                      className="text-xs h-8"
                      inputMode="numeric"
                    />
                  </Field>
                )}
                {hotel.bookingType === 'on_request' && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">قیمت نهایی موقع رزرو استعلام می‌شود؛ اگر سقف تقریبی دارید بنویسید.</p>
                    <Field label="سقف تقریبی (هر نفر، تومان)">
                      <Input
                        value={hotel.pricePerPerson || ''}
                        onChange={(e) => handleUpdateHotel(idx, { pricePerPerson: e.target.value })}
                        placeholder="مثلاً: 45,000,000"
                        className="text-xs h-8"
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                )}
                {!hotel.bookingType && (
                  <Field label="نرخ هر نفر (تومان)" hint="برای ردیف‌های قدیمی؛ با انتخاب نوع رزرو، برچسب دقیق می‌شود.">
                    <Input
                      value={hotel.pricePerPerson || ''}
                      onChange={(e) => handleUpdateHotel(idx, { pricePerPerson: e.target.value })}
                      placeholder="مثلاً: 38,500,000"
                      className="text-xs h-8"
                      inputMode="numeric"
                    />
                  </Field>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">تفکیک نرخ اتاق‌ها (اختیاری) — اگر «نرخ هر نفر» خالی باشد، نرخ اتاق ۲تخته روی سایت نمایش داده می‌شود.</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-card p-3 border border-border/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                        <Users className="size-3.5 text-blue-500" />
                        <span>اتاق ۲تخته *</span>
                      </div>
                      <Input
                        value={hotel.priceDouble || ''}
                        onChange={(e) => handleUpdateHotel(idx, { priceDouble: e.target.value })}
                        placeholder="مثلاً: 38,500,000 تومان"
                        className="text-xs h-8"
                      />
                    </div>

                    <div className="rounded-lg bg-card p-3 border border-border/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                        <User className="size-3.5 text-purple-500" />
                        <span>اتاق ۱تخته</span>
                      </div>
                      <Input
                        value={hotel.priceSingle || ''}
                        onChange={(e) => handleUpdateHotel(idx, { priceSingle: e.target.value })}
                        placeholder="مثلاً: 49,000,000 تومان"
                        className="text-xs h-8"
                      />
                    </div>

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
