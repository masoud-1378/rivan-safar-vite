'use client';

import React, { useState, useId } from 'react';
import { Search, Calendar as CalendarIcon, MapPin, Compass, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toJalali, JALALI_MONTHS, jalaliMonthLength, toGregorian } from '@/lib/jalali';

export interface TravelSearchState {
  destination: string;
  tourKind: 'all' | 'foreign' | 'domestic' | 'exhibition';
  departureDateSolar: string | null;
}

export interface TravelSearchWidgetProps {
  onSearch?: (state: TravelSearchState) => void;
  className?: string;
}

const DESTINATION_OPTIONS = [
  { value: '', label: 'همه مقصدها' },
  { value: 'istanbul', label: 'استانبول (ترکیه)' },
  { value: 'antalya', label: 'آنتالیا (ترکیه)' },
  { value: 'dubai', label: 'دبی (امارات)' },
  { value: 'kish', label: 'جزیره کیش' },
  { value: 'mashhad', label: 'مشهد مقدس' },
  { value: 'phuket', label: 'پوکت (تایلند)' },
  { value: 'china', label: 'چین و گوانگجو' },
];

const TOUR_KINDS = [
  { value: 'all', label: 'همه تورها' },
  { value: 'foreign', label: 'تورهای خارجی' },
  { value: 'domestic', label: 'تورهای داخلی' },
  { value: 'exhibition', label: 'تورهای نمایشگاهی' },
];

export default function TravelSearchWidget({ onSearch, className }: TravelSearchWidgetProps) {
  const [destination, setDestination] = useState('');
  const [tourKind, setTourKind] = useState<'all' | 'foreign' | 'domestic' | 'exhibition'>('all');
  
  // Date Picker State (Solar)
  const todaySolar = toJalali(new Date());
  const [selectedYear, setSelectedYear] = useState(todaySolar.jy);
  const [selectedMonth, setSelectedMonth] = useState(todaySolar.jm);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const formattedSelectedDate = selectedDay
    ? `${selectedDay} ${JALALI_MONTHS[selectedMonth - 1]} ${selectedYear}`
    : null;

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch({
        destination,
        tourKind,
        departureDateSolar: formattedSelectedDate,
      });
    }
  };

  const daysInMonth = jalaliMonthLength(selectedYear, selectedMonth);

  return (
    <div className={cn(
      "w-full bg-card/95 backdrop-blur-md border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl transition-all",
      className
    )}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
        
        {/* 1. Destination Field */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            <span>مقصد سفر</span>
          </label>
          <Select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            options={DESTINATION_OPTIONS}
            className="bg-background text-sm font-medium border-border/80 h-11 rounded-xl"
          />
        </div>

        {/* 2. Tour Kind Field */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Compass className="size-3.5 text-primary" />
            <span>نوع تور</span>
          </label>
          <Select
            value={tourKind}
            onChange={(e) => setTourKind(e.target.value as any)}
            options={TOUR_KINDS}
            className="bg-background text-sm font-medium border-border/80 h-11 rounded-xl"
          />
        </div>

        {/* 3. Jalali Date Popover Field */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="size-3.5 text-primary" />
            <span>تاریخ حرکت (شمسی)</span>
          </label>
          
          <Popover
            open={isDatePickerOpen}
            onOpenChange={setIsDatePickerOpen}
            trigger={
              <button
                type="button"
                className="w-full h-11 px-3 rounded-xl border border-border/80 bg-background text-start text-sm flex items-center justify-between hover:border-primary/50 transition-colors"
              >
                <span className={cn(
                  "truncate font-medium",
                  formattedSelectedDate ? "text-foreground" : "text-muted-foreground"
                )}>
                  {formattedSelectedDate || "انتخاب تاریخ"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground shrink-0" />
              </button>
            }
          >
            <div className="p-3 w-64 bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-primary">تقویم شمسی</span>
                <span className="text-xs text-muted-foreground">{selectedYear}</span>
              </div>

              {/* Month Selector */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {JALALI_MONTHS.map((monthName, idx) => {
                  const mNum = idx + 1;
                  const isCur = selectedMonth === mNum;
                  return (
                    <button
                      key={monthName}
                      type="button"
                      onClick={() => setSelectedMonth(mNum)}
                      className={cn(
                        "text-xs py-1.5 rounded-lg transition-colors font-medium",
                        isCur ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-foreground"
                      )}
                    >
                      {monthName}
                    </button>
                  );
                })}
              </div>

              {/* Day Grid Preview */}
              <div className="pt-2 border-t border-border">
                <div className="text-[11px] text-muted-foreground mb-1 text-center font-medium">روز حرکت</div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                    const dayNum = dIdx + 1;
                    const isSelected = selectedDay === dayNum;
                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => {
                          setSelectedDay(dayNum);
                          setIsDatePickerOpen(false);
                        }}
                        className={cn(
                          "size-7 rounded-md flex items-center justify-center font-medium transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Popover>
        </div>

        {/* 4. Action Button */}
        <div className="lg:col-span-2 flex flex-col justify-end">
          <Button
            variant="brand"
            size="lg"
            onClick={handleSearchClick}
            className="w-full h-11 rounded-xl text-sm font-bold gap-1.5 px-2 shadow-md hover:shadow-lg transition-all"
          >
            <Search className="size-4 shrink-0" />
            <span className="whitespace-nowrap">جستجوی تور</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
