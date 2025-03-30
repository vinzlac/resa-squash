import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/app/constants/cookies';

const publicPaths = ['/login', '/unauthorized', '/api'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAMES.TEAMR_TOKEN)?.value;
  const currentPath = request.nextUrl.pathname;
  
  // Allow API routes to be handled by their own auth logic
  if (currentPath.startsWith('/api')) {
    return NextResponse.next();
  }
  
  const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  if (token && isPublicPath && currentPath !== '/api' && !currentPath.startsWith('/api/')) {
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
    '/settings/:path*',
    '/api/:path*',
  ]
}; 