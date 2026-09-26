'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { 
  Compass, 
  Building2, 
  Map, 
  ShieldCheck, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Save, 
  Eye, 
  History,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { fa, faNumber, cn } from '@/lib/utils';
import type { 
  DestinationTree, 
  OriginRow, 
  TourInput, 
  TourRow 
} from './actions';
import { saveTour, checkSlugUnique } from './actions';
import type { HotelRow } from '../hotels/actions';
import { validateDraft } from './tour-helpers';

// 5 Modular Stage Components
import Stage1Identity from './stages/Stage1Identity';
import Stage2Hotels from './stages/Stage2Hotels';
import Stage3Itinerary from './stages/Stage3Itinerary';
import Stage4TrustTerms from './stages/Stage4TrustTerms';
import Stage5Consultant from './stages/Stage5Consultant';

export interface TourFormProps {
  initial?: TourRow | null;
  editingId?: string | null;
  onDone: () => void;
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelRow[];
}

export type StageId = 1 | 2 | 3 | 4 | 5;

interface StageTabConfig {
  id: StageId;
  label: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STAGES: StageTabConfig[] = [
  { id: 1, shortTitle: '۱. هویت و نرخ', label: 'هویت، ترابری و نرخ پایه', icon: Compass, description: 'مقصد، نحوه حرکت، کف قیمت' },
  { id: 2, shortTitle: '۲. هتل و اتاق', label: 'هتل‌ها و اتاق‌ها', icon: Building2, description: 'ماتریس ستاره، تخت و وعده‌ها' },
  { id: 3, shortTitle: '۳. برنامه سفر', label: 'برنامه روزبه‌روز و خدمات', icon: Map, description: 'تایم‌لاین گشت‌ها و ترانسفر' },
  { id: 4, shortTitle: '۴. سپر اعتماد', label: 'سپر اعتماد و مدارک', icon: ShieldCheck, description: 'ویزا، عوارض شهری، بار مجاز' },
  { id: 5, shortTitle: '۵. کارشناس', label: 'کارشناس و انتشار', icon: UserCheck, description: 'پادکست، مشاور مسیر، تأیید' },
];

export default function TourForm({
  initial,
  editingId,
  onDone,
  tree,
  origins,
  hotels,
}: TourFormProps) {
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState<StageId>(1);
  const [isPending, startTransition] = useTransition();
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [touched, setTouched] = useState(false);

  // Initial State mapping
  const [formData, setFormData] = useState<TourInput>(() => {
    return {
      slug: initial?.slug || '',
      title: initial?.title || '',
      type: initial?.type || 'foreign',
      typeLabel: initial?.typeLabel || 'پکیج آماده',
      destinationSlugs: Array.isArray(initial?.destinationSlugs) 
        ? (initial.destinationSlugs as string[]) 
        : [],
      destination: initial?.destination || '',
      origin: initial?.origin || (origins[0]?.slug || ''),
      route: initial?.route || '',
      duration: initial?.duration || '',
      nights: Number(initial?.nights) || 0,
      closestDeparture: initial?.closestDeparture || '',
      price: Number(initial?.price) || 0,
      formattedPrice: initial?.formattedPrice || '',
      priceNote: initial?.priceNote || 'برای هر بزرگسال در اتاق دو تخته',
      status: initial?.status || 'pending',
      statusLabel: initial?.statusLabel || 'پیش‌نویس',
      image: initial?.image || '',
      badge: initial?.badge || '',
      features: Array.isArray(initial?.features) ? (initial.features as string[]) : [],
      visaRequired: Boolean(initial?.visaRequired),
      hotelStars: Number(initial?.hotelStars) || 4,
      airline: initial?.airline || '',
      includedServices: Array.isArray(initial?.includedServices) ? (initial.includedServices as string[]) : [],
      excludedServices: Array.isArray(initial?.excludedServices) ? (initial.excludedServices as string[]) : [],
      hotelOptions: Array.isArray(initial?.hotelOptions) ? (initial.hotelOptions as any[]) : [],
      description: initial?.description || '',
      transportKind: /قطار|بن ریل|فدک|رجاء/i.test(initial?.airline || '') ? 'rail' :
                     /اتوبوس|زمینی|vip/i.test(initial?.airline || '') ? 'land' : 'air',
      carrierName: initial?.airline || '',
      guaranteedDeparture: initial?.badge === 'حرکت تضمین‌شده',
      splitPriceCurrency: 'USD',
      splitPriceAmount: '',
      itineraryDays: [],
      trustSpecs: {
        returnGuarantee: '',
        cityTax: '',
        tipsNote: '',
        luggageKg: 30,
        activityLevel: 'easy',
        requiredDocs: [],
      },
      consultantSpec: {
        name: '',
        title: '',
        phone: '',
        audioUrl: '',
        emergencyPhone: '',
      },
    };
  });

  const updateFormData = (fields: Partial<TourInput>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // Validation
  const errors = useMemo(() => {
    return touched
      ? validateDraft({
          title: formData.title,
          slug: formData.slug,
          price: formData.price,
          destinations: formData.destinationSlugs.length,
          origin: formData.origin,
        })
      : {};
  }, [formData, touched]);

  // Handle Save
  const handleSave = async () => {
    setTouched(true);
    const draftErrors = validateDraft({
      title: formData.title,
      slug: formData.slug,
      price: formData.price,
      destinations: formData.destinationSlugs.length,
      origin: formData.origin,
    });

    if (Object.keys(draftErrors).length > 0) {
      toast({
        title: 'اطلاعات تور ناقص است',
        description: 'لطفاً فیلدهای الزامی مرحله اول (عنوان، نامک، مقصد و قیمت پایه) را کامل کنید.',
        variant: 'error',
      });
      setActiveStage(1);
      return;
    }

    startTransition(async () => {
      try {
        const slugCheck = await checkSlugUnique(formData.slug, editingId);
        if (!slugCheck.unique) {
          toast({
            title: 'نامک تکراری است',
            description: 'این نامک انگلیسی قبلاً برای تور دیگری استفاده شده است.',
            variant: 'error',
          });
          setActiveStage(1);
          return;
        }

        await saveTour(editingId ?? null, formData);
        toast({
          title: editingId ? 'تور با موفقیت بروزرسانی شد' : 'تور جدید با موفقیت ایجاد شد',
          description: `تور «${formData.title}» ذخیره شد.`,
        });
        onDone();
      } catch (err: any) {
        toast({
          title: 'خطا در ثبت تور',
          description: err.message || 'مشکلی رخ داد، لطفاً دوباره تلاش کنید.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Step Navigation Header */}
      <div className="rounded-2xl border border-border bg-card p-2 sm:p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            const isPassed = activeStage > stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl p-3 text-right transition-all border",
                  isActive
                    ? "border-brand bg-brand/10 shadow-sm"
                    : isPassed
                    ? "border-border/70 bg-secondary/30 hover:bg-secondary/60"
                    : "border-transparent bg-transparent hover:bg-muted/40 opacity-70"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={cn(
                    "flex size-7 items-center justify-center rounded-lg text-xs font-bold",
                    isActive 
                      ? "bg-brand text-brand-foreground" 
                      : isPassed 
                      ? "bg-emerald-500/20 text-emerald-600" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isPassed ? <Check className="size-4" /> : stage.id}
                  </div>
                  <Icon className={cn("size-4", isActive ? "text-brand" : "text-muted-foreground")} />
                </div>

                <div className="mt-1">
                  <div className={cn(
                    "text-xs font-bold leading-tight line-clamp-1",
                    isActive ? "text-foreground" : "text-foreground/80"
                  )}>
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate hidden sm:block mt-0.5">
                    {stage.description}
                  </div>
                </div>

                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Active Stage Body */}
        <div className={cn(showLivePreview ? "xl:col-span-8" : "xl:col-span-12", "space-y-6")}>
          {activeStage === 1 && (
            <Stage1Identity
              data={formData}
              onChange={updateFormData}
              errors={errors}
              tree={tree}
              origins={origins}
            />
          )}

          {activeStage === 2 && (
            <Stage2Hotels
              data={formData}
              onChange={updateFormData}
            />
          )}

          {activeStage === 3 && (
            <Stage3Itinerary
              data={formData}
              onChange={updateFormData}
            />
          )}

          {activeStage === 4 && (
            <Stage4TrustTerms
              data={formData}
              onChange={updateFormData}
            />
          )}

          {activeStage === 5 && (
            <Stage5Consultant
              data={formData}
              onChange={updateFormData}
            />
          )}

          {/* Bottom Sticky Action Bar */}
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur">
            {/* Step navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStage === 1}
                onClick={() => setActiveStage((p) => Math.max(1, p - 1) as StageId)}
                className="gap-1.5 text-xs"
              >
                <ChevronRight className="size-4" />
                مرحله قبلی
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStage === 5}
                onClick={() => setActiveStage((p) => Math.min(5, p + 1) as StageId)}
                className="gap-1.5 text-xs"
              >
                مرحله بعدی
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Eye className="size-4" />
                {showLivePreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش زنده'}
              </Button>
            </div>

            {/* Save / Cancel buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDone}
                className="text-xs"
              >
                انصراف
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={handleSave}
                className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90 text-xs px-4"
              >
                <Save className="size-4" />
                {isPending ? 'در حال ثبت…' : editingId ? 'ذخیره تغییرات تور' : 'ثبت و انتشار تور'}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-foreground">پیش‌نمایش کارت تور در سایت</span>
                <span className="text-[11px] text-muted-foreground">مشاهده زنده</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    بدون تصویر
                  </div>
                )}

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand">
                      {formData.carrierName || formData.airline || 'هوایی'}
                    </span>
                    {formData.badge && (
                      <span className="rounded-md bg-brand/10 text-brand px-2 py-0.5 text-[10px] font-bold">
                        {formData.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {formData.title || 'عنوان تور…'}
                  </h4>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>{formData.duration || 'مدت اقامت نامشخص'}</span>
                    <span>{formData.origin ? `از ${formData.origin}` : 'مبدأ نامشخص'}</span>
                  </div>

                  <div className="border-t border-border/50 pt-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-muted-foreground">شروع قیمت از:</span>
                    <div className="text-left font-bold text-foreground">
                      <span className="text-sm font-black">{faNumber(Number(formData.price) || 0)}</span>
                      <span className="text-[10px] text-muted-foreground mr-1">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
