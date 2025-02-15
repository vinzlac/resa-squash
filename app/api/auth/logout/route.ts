import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Supprimer le cookie en le faisant expirer
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0)
  });

  return response;
} 