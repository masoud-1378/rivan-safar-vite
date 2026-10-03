import { Alert } from '@/components/ui/alert';
import { getAllDraftFallbackAnswer } from '../settings/actions';
import { getPublishedToursCount } from './actions';
import { AllDraftFallbackAskButton } from './AllDraftFallbackDialog';

/**
 * قلم ۴ موج ۱ (تصمیم ۴، ۱۴۰۵/۰۷/۱۱): بنر سؤال «همه پیش‌نویس».
 *
 * هر وقت صفحهٔ تورها با «صفر تور منتشرشده» و «بدون جواب ذخیره‌شده» رندر شود،
 * این بنر سؤال را از مدیر می‌پرسد. تورِ تازهٔ منتشرشده یا جوابِ ثبت‌شده، بنر
 * را خودبه‌خود محو می‌کند. مسیرهای ویرایشگر (TourForm) دیالوگ را همان لحظه
 * باز می‌کنند؛ این بنر تورِ امنِ همهٔ مسیرهاست.
 */
export async function AllDraftFallbackBanner() {
  let published = -1;
  let answer: 'sample' | 'empty' | null = null;
  try {
    [published, answer] = await Promise.all([getPublishedToursCount(), getAllDraftFallbackAnswer()]);
  } catch {
    // دیتابیس در دسترس نیست → بنر نه؛ صفحه با همان خطای خودش بالا می‌آید.
    return null;
  }
  if (published !== 0 || answer !== null) return null;
  return (
    <Alert variant="warning" title="هیچ توری روی سایت نیست">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>محتوای نمایشی (تور نمونه) نشان داده شود یا صفحه خالی بماند؟</p>
        <AllDraftFallbackAskButton label="انتخاب می‌کنم" />
      </div>
    </Alert>
  );
}
