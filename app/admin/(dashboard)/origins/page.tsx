import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'مبدأها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

/** مسیر قدیمی؛ کاتالوگ یکپارچه جایگزینش شده تا لینک‌های داخلی نشکنند. */
export default function AdminOriginsPage() {
  redirect('/admin/catalog?tab=origins');
}
