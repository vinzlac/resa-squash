import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const currentPath = request.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(currentPath);

  // Si pas de token et pas sur une page publique -> redirection login
  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  // Si token et sur une page publique -> redirection home
  if (token && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 