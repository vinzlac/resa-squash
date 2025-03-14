import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/app/constants/cookies';

const publicPaths = ['/login', '/unauthorized'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAMES.TEAMR_TOKEN)?.value;
  const currentPath = request.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(currentPath);

  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  if (token && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();

}

export const config = {
  matcher: [
    '/reservations/:path*',
    '/admin/:path*',
    '/settings/:path*'
  ]
}; 