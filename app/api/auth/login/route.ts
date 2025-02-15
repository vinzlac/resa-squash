import { NextRequest, NextResponse } from 'next/server';

const TEAMR_AUTH_URL = 'https://app.teamr.eu/users/custom/authenticate/v2';
const CUSTOM_ID = '5dd6b3961510c91d353b0833';

interface TeamRAuthRequest {
  credentials: {
    email: string;
    password: string;
  };
  customId: string;
  deviceInfo: {
    os: string;
    model: string;
    brand: string;
    version: string;
  };
  coachAuthentication: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const authRequest: TeamRAuthRequest = {
      credentials: {
        email,
        password,
      },
      customId: CUSTOM_ID,
      deviceInfo: {
        os: 'iOS 18.3.1',
        model: 'iPhone 12 Pro',
        brand: 'Apple',
        version: '3.0.20',
      },
      coachAuthentication: false,
    };

    const response = await fetch(TEAMR_AUTH_URL, {
      method: 'POST',
      headers: {
        'Host': 'app.teamr.eu',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0',
      },
      body: JSON.stringify(authRequest),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const data = await response.json();
    
    const responseJson = NextResponse.json({
      success: true,
      user: {
        id: data.userId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      }
    });

    responseJson.cookies.set({
      name: 'authToken',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 heures
    });

    return responseJson;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 