import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAMES } from '@/app/constants/cookies';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Détection intelligente pour secure cookies
  const isSecure = process.env.NODE_ENV === 'production' && 
                  (request.headers.get('x-forwarded-proto') === 'https' || 
                   request.url.startsWith('https://'));
  
  response.cookies.set({
    name: COOKIE_NAMES.TEAMR_TOKEN,
    value: '',
    httpOnly: true,
    secure: isSecure,   // Secure seulement en production avec HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
} 