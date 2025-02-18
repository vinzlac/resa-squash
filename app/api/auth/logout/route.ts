import { NextResponse } from 'next/server';
import { COOKIE_NAMES } from '@/app/constants/cookies';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: COOKIE_NAMES.TEAMR_TOKEN,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
} 