import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getMaintenanceState } from '@/src/lib/maintenance';
import { renderMaintenancePage } from '@/src/lib/maintenance-page';

/**
 * محافظت از /admin/* : بدون نشست معتبر → /admin/login
 * (بررسی نقش owner/editor در Server Actionها و صفحات انجام می‌شود)
 *
 * دروازهٔ حالت تعمیرات: وقتی site.maintenance در تنظیمات روشن است، همهٔ
 * مسیرهای عمومی سایت صفحهٔ تعمیرات با استاتوس ۵۰۳ می‌گیرند. /admin/* و
 * فایل‌های استاتیک از این دروازه مستثنا هستند تا مدیر خودش را بیرون نیندازد.
 * پرچم تعمیرات با کش ۳۰ ثانیه‌ای خوانده می‌شود تا هر ریکوئست به دیتابیس نزند.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const state = await getMaintenanceState();
  if (!state.enabled) return NextResponse.next();

  return new NextResponse(renderMaintenancePage(state), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    // همهٔ مسیرهای عمومی؛ استاتیک‌ها از دروازهٔ تعمیرات مستثنا هستند
    '/((?!_next/static|_next/image|favicon\\.ico|images|fonts).*)',
  ],
};
