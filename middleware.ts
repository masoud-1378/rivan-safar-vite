import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * محافظت از /admin/* : بدون نشست معتبر → /admin/login
 * (بررسی نقش owner/editor در Server Actionها و صفحات انجام می‌شود)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();
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

export const config = {
  matcher: ['/admin/:path*'],
};
