import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ authorized: false }, { status: 400 });
    }

    const result = await executeQuery(
      'SELECT email FROM authorized_users WHERE email = $1',
      [email]
    );

    return NextResponse.json({ 
      authorized: result.length > 0 
    });
  } catch (error) {
    console.error('Erreur de vérification:', error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
} 