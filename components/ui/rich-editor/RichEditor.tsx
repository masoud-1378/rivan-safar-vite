'use client';

import dynamic from 'next/dynamic';
import type { RichEditorProps } from './types';

/**
 * RichEditor — نقطهٔ ورود ویرایشگر متن غنی.
 *
 * لود تنبل: خود ویرایشگر (و کل باندل تایپ‌تپ) فقط وقتی لود می‌شود که این
 * کامپوننت رندر شود — یعنی فقط در پنل ادمین، نه در سایت عمومی.
 */
const RichEditorImpl = dynamic(() => import('./RichEditorInner').then((m) => m.RichEditorInner), {
  ssr: false,
  loading: () => (
    <div className="rich-editor-loading" dir="rtl">
      در حال بارگذاری ویرایشگر…
    </div>
  ),
});

export function RichEditor(props: RichEditorProps) {
  return <RichEditorImpl {...props} />;
}

export type { RichEditorProps, PickedImage } from './types';
