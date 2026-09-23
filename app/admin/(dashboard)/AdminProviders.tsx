'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider max={3} position="bottom-start">
      {children}
    </ToastProvider>
  );
}
