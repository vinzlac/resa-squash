import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/app/types/auth';

const publicPaths = ['/login', '/unauthorized'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
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

  try {
    if (!token) throw new Error('No token');
    const decoded = jwtDecode<DecodedToken>(token);
    const email = decoded.email;

    // Vérifier l'autorisation uniquement pour les routes admin
    if (currentPath.startsWith('/admin')) {
      const response = await fetch(`${request.nextUrl.origin}/api/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          queryType: 'check_auth',
          params: [email]
        })
      });

      if (!response.ok) {
        // Lire la réponse en tant que texte pour voir le contenu exact
        const errorText = await response.text();
        console.error('Erreur lors de la requête à /api/db:', errorText);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const data = await response.json();
      if (data.rows.length === 0) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Erreur lors de la requête à /api/db:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

export const config = {
  matcher: [
    '/reservations/:path*',
    '/admin/:path*',
    '/settings/:path*'
  ]
}; 