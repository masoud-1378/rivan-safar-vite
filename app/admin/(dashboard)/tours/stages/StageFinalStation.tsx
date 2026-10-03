'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Flag,
  Send,
  EyeOff,
  Save,
  Pencil,
  CalendarDays,
  MapPin,
  Wallet,
  Building2,
  Map as MapIcon,
  ShieldCheck,
  UserCheck,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { fa, formatToman, en } from '@/lib/utils';
import type { DestinationTree, TourInput } from '../actions';

export interface StageFinalStationProps {
  data: TourInput;
  /** فاز B5 موج ۲: «مبنای قیمت» دیگر ستون نیست — از تنظیم tours.default_price_note می‌آید. */
  priceNoteDefault?: string;
  tree: DestinationTree;
  onGoToStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  /**
   * انتشارِ گیت‌دار (موج ۱، قلم ۲): خودِ TourForm گیت checkPublishReadiness را
   * صدا می‌زند و همان دیالوگ فهرست ناقصی‌ها (MissingChecksDialog) یا دیالوگ
   * تأیید انتشار (PublishConfirmDialog) را نشان می‌دهد — این مرحله گیت دوم نمی‌سازد.
   */
  onRequestPublish: () => void;
  /** ذخیره با نیت نگه‌داشت/پیش‌نویس — فقط بعد از تأییدِ دیالوگِ همین مرحله. */
  onSaveIntent: (intent: 'keep' | 'draft') => void;
}

/** «۳۸٬۵۰۰٬۰۰۰» یا «38500000» → 38500000؛ خالی/نامعتبر → null (همان منطق مرحلهٔ ۲) */
function priceNumber(v?: string | null): number | null {
  const digits = en(String(v || ''))
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');
  return digits ? Number(digits) : null;
}

function Empty({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

interface SummaryRow {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  stage: 1 | 2 | 3 | 4 | 5;
  body: ReactNode;
}

/**
 * ایستگاه پایانی (موج ۱، قلم ۵): کارت جمع‌بندی خودکار از همهٔ مرحله‌ها —
 * هر ردیف لینک «ویرایش» به مرحلهٔ مربوط دارد — + دکمهٔ انتشارِ گیت‌دار.
 * فعلاً مرحلهٔ ۶ ویزارد است (باگ شماره‌گذاری موج ۱، ۱۴۰۵/۰۷/۱۱)؛ وقتی موج ۳
 * مرحلهٔ واقعی ۶ (هزینه‌ها و شرایط) را ساخت، همین کامپوننت می‌شود مرحلهٔ ۷.
 */
export default function StageFinalStation({
  data,
  priceNoteDefault,
  tree,
  onGoToStage,
  onRequestPublish,
  onSaveIntent,
}: StageFinalStationProps) {
  const isPublished = data.publishStatus === 'published';
  const tourName = data.title.trim() || 'بدون عنوان';
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

  const rows: SummaryRow[] = useMemo(() => {
    const nameBySlug: Record<string, string> = {};
    for (const d of tree?.all ?? []) nameBySlug[d.slug] = d.name;
    const destNames = (data.destinationSlugs || [])
      .map((s) => nameBySlug[s] || s)
      .filter((n) => n.trim());

    const dateParts: string[] = [];
    if (data.duration.trim()) dateParts.push(data.duration.trim());
    if (data.nights > 0) dateParts.push(`${fa(data.nights)} شب`);
    if (data.closestDeparture.trim())
      dateParts.push(`نزدیک‌ترین حرکت: ${fa(data.closestDeparture.trim())}`);

    const hotels = (data.hotelOptions || []).filter((h) => (h.name || '').trim());
    const days = (data.itineraryDays || []).filter((d) => (d.title || '').trim());
    const docs = (data.trustSpecs?.requiredDocs || []).filter((d) => (d || '').trim());
    const consultant = data.consultantSpec || {};
    const consultantName = (consultant.name || '').trim();
    const consultantTitle = (consultant.title || '').trim();
    const consultantPhone = (consultant.phone || '').trim();

    return [
      {
        key: 'title',
        label: 'عنوان تور',
        icon: Tag,
        stage: 1,
        body: data.title.trim() ? (
          <span>
            <span className="font-bold">{data.title.trim()}</span>
            {data.slug.trim() && (
              <span className="block text-[11px] text-muted-foreground" dir="ltr">
                /tour/{data.slug.trim()}
              </span>
            )}
          </span>
        ) : (
          <Empty>هنوز عنوان وارد نشده است.</Empty>
        ),
      },
      {
        key: 'destination',
        label: 'مقصد',
        icon: MapPin,
        stage: 1,
        body:
          destNames.length > 0 ? (
            destNames.join('، ')
          ) : data.destination.trim() ? (
            data.destination.trim()
          ) : (
            <Empty>مقصدی انتخاب نشده است.</Empty>
          ),
      },
      {
        key: 'dates',
        label: 'تاریخ و مدت',
        icon: CalendarDays,
        stage: 1,
        body:
          dateParts.length > 0 ? (
            dateParts.join(' · ')
          ) : (
            <Empty>تاریخ و مدت ثبت نشده است.</Empty>
          ),
      },
      {
        key: 'prices',
        label: 'قیمت‌ها',
        icon: Wallet,
        stage: 1,
        body:
          data.price > 0 ? (
            <span>
              <span className="font-bold">{formatToman(data.price)}</span>
              {(priceNoteDefault || '').trim() && (
                <span className="text-muted-foreground"> — {(priceNoteDefault || '').trim()}</span>
              )}
            </span>
          ) : (
            <Empty>قیمت پایه وارد نشده است.</Empty>
          ),
      },
      {
        key: 'hotels',
        label: 'هتل‌ها',
        icon: Building2,
        stage: 2,
        body:
          hotels.length === 0 ? (
            <Empty>هتلی ثبت نشده است.</Empty>
          ) : (
            <span>
              <span className="block">{fa(hotels.length)} هتل</span>
              <span className="block text-[11px] text-muted-foreground">
                {hotels
                  .slice(0, 3)
                  .map((h) => {
                    const rate =
                      priceNumber(h.pricePerPerson) ?? priceNumber(h.priceDouble);
                    return `${(h.name || '').trim()}${
                      rate !== null ? ` — ${formatToman(rate)}` : ' — بدون قیمت'
                    }`;
                  })
                  .join('، ')}
                {hotels.length > 3 ? ` و ${fa(hotels.length - 3)} هتل دیگر…` : ''}
              </span>
            </span>
          ),
      },
      {
        key: 'itinerary',
        label: 'برنامهٔ سفر',
        icon: MapIcon,
        stage: 3,
        body:
          days.length === 0 ? (
            <Empty>برنامهٔ روزانه‌ای ثبت نشده است.</Empty>
          ) : (
            <span>
              <span className="block">{fa(days.length)} روز برنامه</span>
              <span className="block text-[11px] text-muted-foreground">
                {days
                  .slice(0, 3)
                  .map((d) => (d.title || '').trim())
                  .join('، ')}
                {days.length > 3 ? '…' : ''}
              </span>
            </span>
          ),
      },
      {
        key: 'visa',
        label: 'ویزا و مدارک',
        icon: ShieldCheck,
        stage: 4,
        body: (
          <span>
            {data.visaRequired ? 'نیاز به ویزا دارد' : 'نیاز به ویزا ندارد'}
            <span className="text-muted-foreground">
              {' '}
              — {docs.length > 0 ? `${fa(docs.length)} مدرک لازم ثبت شده` : 'مدرکی ثبت نشده'}
            </span>
          </span>
        ),
      },
      {
        key: 'consultant',
        label: 'کارشناس',
        icon: UserCheck,
        stage: 5,
        body: consultantName ? (
          <span>
            <span className="font-bold">{consultantName}</span>
            {consultantTitle && (
              <span className="text-muted-foreground"> — {consultantTitle}</span>
            )}
            {consultantPhone && (
              <span className="text-muted-foreground" dir="ltr">
                {' '}
                — {consultantPhone}
              </span>
            )}
          </span>
        ) : (
          <Empty>کارشناس ثبت نشده است.</Empty>
        ),
      },
    ];
  }, [data, tree]);

  return (
    <div className="space-y-6">
      {/* سربرگ مرحله (الگوی سربرگ مرحله‌های دیگر) */}
      <div className="flex items-center justify-between rounded-sm border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <Flag className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">ایستگاه پایانی: جمع‌بندی و انتشار</h3>
            <p className="text-xs text-muted-foreground">
              آخرین نگاه پیش از انتشار؛ هر ردیف را می‌توانی همان‌جا ویرایش کنی.
            </p>
          </div>
        </div>
      </div>

      {/* کارت جمع‌بندی خودکار */}
      <div className="rounded-sm border border-border bg-card p-5">
        <h4 className="text-xs font-bold text-foreground">خلاصهٔ تور</h4>
        <dl className="mt-2 divide-y divide-border/60">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.key}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 text-xs leading-5 text-foreground">{row.body}</dd>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => onGoToStage(row.stage)}
                >
                  <Pencil className="size-3.5" />
                  ویرایش
                </Button>
              </div>
            );
          })}
        </dl>
      </div>

      {/* انتشار */}
      <div className="space-y-4 rounded-sm border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground">انتشار</h4>
          <Badge variant={isPublished ? 'success' : 'warning'}>
            {isPublished ? 'منتشرشده' : 'پیش‌نویس'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {isPublished
            ? 'این تور منتشر شده و روی سایت دیده می‌شود.'
            : 'این تور هنوز منتشر نشده و روی سایت دیده نمی‌شود.'}
        </p>

        {!isPublished ? (
          <Button
            type="button"
            onClick={onRequestPublish}
            className="h-11 gap-2 bg-brand px-6 text-xs text-brand-foreground hover:bg-brand/90 sm:h-9"
          >
            <Send className="size-4" />
            انتشار تور
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowUpdateConfirm(true)}
              className="h-11 gap-2 bg-brand px-6 text-xs text-brand-foreground hover:bg-brand/90 sm:h-9"
            >
              <Save className="size-4" />
              به‌روزرسانی انتشار
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUnpublishConfirm(true)}
              className="h-11 gap-2 px-4 text-xs text-destructive hover:text-destructive sm:h-9"
            >
              <EyeOff className="size-4" />
              برگرداندن به پیش‌نویس
            </Button>
          </div>
        )}
      </div>

      {/* تأیید به‌روزرسانی انتشار (الگوی دیالوگ تأیید انتشارِ قلم ۲) */}
      <AlertDialog
        open={showUpdateConfirm}
        onOpenChange={setShowUpdateConfirm}
        title={`تور «${tourName}» به‌روزرسانی شود؟`}
        description="تغییرات ذخیره می‌شود و نسخهٔ تازهٔ تور روی سایت دیده می‌شود."
        confirmText="به‌روزرسانی"
        cancelText="انصراف"
        onConfirm={() => onSaveIntent('keep')}
      />

      {/* تأیید برگرداندن به پیش‌نویس */}
      <AlertDialog
        open={showUnpublishConfirm}
        onOpenChange={setShowUnpublishConfirm}
        title={`تور «${tourName}» به پیش‌نویس برگردد؟`}
        description="این تور از سایت پنهان می‌شود، ولی از فهرست تورها حذف نمی‌شود."
        confirmText="برگرداندن به پیش‌نویس"
        cancelText="انصراف"
        destructive
        onConfirm={() => onSaveIntent('draft')}
      />
    </div>
  );
}
