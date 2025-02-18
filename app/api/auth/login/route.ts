import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedEmail } from '@/app/lib/auth';
import { authenticateUser } from '@/app/services/teamrService';
import { COOKIE_NAMES } from '@/app/constants/cookies';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!await isAuthorizedEmail(email)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation d\'accéder à cette application' },
        { status: 403 }
      );
    }

    try {
      const data = await authenticateUser(email, password);
      
      const responseJson = NextResponse.json({
        success: true,
        user: {
          id: data.userId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          DOB: data.user.DOB,
          isAuthorized: true
        }
      });

      responseJson.cookies.set({
        name: COOKIE_NAMES.TEAMR_TOKEN,
        value: data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 heures
      });

      return responseJson;
    } catch (error) {
      // Erreur d'authentification TeamR
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur d\'authentification' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 