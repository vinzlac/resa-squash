import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Ajouter des logs pour déboguer
  console.log('Middleware - Path:', request.nextUrl.pathname);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Is login page:', isLoginPage);

  if (!token && !isLoginPage) {
    console.log('Middleware - Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    console.log('Middleware - Redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 