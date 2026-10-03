'use client';

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaPickerDialog } from './MediaPickerDialog';
import type { PickedImage } from './types';

export interface OpenMediaPickerOptions {
  /** tag قرارداد (`guide:<slug>` یا `guide`) — فیلتر گرید و برچسب آپلود تازه */
  tag?: string;
  /** عنوان دلخواه دیالوگ */
  title?: string;
}

/**
 * دیالوگ کتابخانهٔ رسانه را باز می‌کند و با انتخاب کاربر برمی‌گردد.
 * انصراف → `null`.
 *
 * خودش را روی `document.body` سوار می‌کند؛ نیازی به Provider در layout نیست.
 */
export function openMediaPicker(opts?: OpenMediaPickerOptions): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const finish = (value: PickedImage | null) => {
      // ریرندر بعدی لازم نیست؛ مستقیم جمعش می‌کنیم.
      setTimeout(() => {
        root.unmount();
        host.remove();
      }, 0);
      resolve(value);
    };
    root.render(
      <React.StrictMode>
        <MediaPickerDialog
          open
          tag={opts?.tag ?? ''}
          title={opts?.title}
          onPick={(picked) => finish(picked)}
          onClose={() => finish(null)}
        />
      </React.StrictMode>,
    );
  });
}
