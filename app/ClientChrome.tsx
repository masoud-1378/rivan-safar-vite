'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

/** پوسته کلاینت: هدر/فوتر + وضعیت بنر — محتوای هر صفحه از app router می‌آید */
export default function ClientChrome({
  children,
}: {
  children: ReactNode;
}) {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const navigateTo = (path: string) => {
    let target = path;
    if (target.startsWith('#/')) {
      target = target.replace('#', '');
    } else if (target.startsWith('#')) {
      if (target === '#tours') target = '/tours';
      else target = `/${target.replace(/^#/, '')}`;
    }
    router.push(target);
  };

  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen bg-page-background text-text-primary font-sans flex flex-col justify-between selection:bg-brand-orange selection:text-white">
      <Navbar
        showAnnouncement={showAnnouncement}
        setShowAnnouncement={setShowAnnouncement}
        onNavigate={navigateTo}
        currentPath={pathname}
      />
      <main
        className={`flex-1 pb-32 lg:pb-0 transition-[padding-top] duration-300 ${
          isHomePage
            ? 'pt-0'
            : showAnnouncement
              ? 'pt-[118px] md:pt-[124px]'
              : 'pt-[80px] md:pt-[90px]'
        }`}
      >
        {children}
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
