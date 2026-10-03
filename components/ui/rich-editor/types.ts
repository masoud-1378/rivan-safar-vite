import type { ReactNode } from 'react';
import type { AnyExtension } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@/lib/rich-text';
// قرارداد انتخاب عکس از کتابخانهٔ رسانه (تیم کتابخانهٔ رسانه)
import type { PickedImage } from '@/components/ui/media-library/types';

export type { PickedImage };

export interface RichEditorProps {
  value: JSONContent | null;
  onChange: (json: JSONContent) => void;
  /** 'full' همهٔ امکانات؛ 'light' فقط bold/ایتالیک/لیست/لینک */
  variant?: 'full' | 'light';
  placeholder?: string;
  /** اگر داده شود، دکمهٔ «انتخاب از کتابخانه» در دیالوگ عکس فعال می‌شود */
  pickImage?: () => Promise<PickedImage | null>;
  /**
   * ردیف اول نوار ابزار — خانهٔ «بلوک‌های ریوان سفر».
   * می‌تواند نود ساده یا تابعی باشد که نمونهٔ editor را می‌گیرد
   * (برای دکمه‌هایی که روی ویرایشگر فرمان می‌زنند).
   * اگر چیزی داده نشود و variant برابر 'full' باشد، نوار بلوک‌های ریوان سفر
   * گذاشته می‌شود.
   */
  extraToolbar?: ReactNode | ((editor: Editor) => ReactNode);
  /** اکستنشن‌های اضافهٔ تایپ‌تپ که همراه extraToolbar می‌آیند */
  extraExtensions?: AnyExtension[];
}
