import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'مقصدها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

/** گشت (ایراد ۹): این مسیر ۴۰۴ می‌داد؛ مثل هتل‌ها و مبدأها به هاب کاتالوگ می‌رود. */
export default function AdminDestinationsPage() {
  redirect('/admin/catalog?tab=destinations');
}
