import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'ورود به پنل مدیریت | ریوان سفر',
  robots: 'noindex,nofollow',
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
