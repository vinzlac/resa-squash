import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedEmail } from '@/app/lib/auth';
import { authenticateUser } from '@/app/services/common';
import { COOKIE_NAMES } from '@/app/constants/cookies';
import { decodeTeamRJwtToken } from '@/app/utils/auth';
import { getUserRights } from '@/app/services/rightsService';
import { logConnexion } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!await isAuthorizedEmail(email)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation d\'accéder à cette application' },
        { status: 403 }
      );
    }

    try {
      const data = await authenticateUser(email, password);
      const decodedToken = decodeTeamRJwtToken(data.token);
      
      // Récupérer les droits de l'utilisateur
      const userRights = await getUserRights(decodedToken.userId);
      
      const responseJson = NextResponse.json({
        success: true,
        user: {
          id: decodedToken.userId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          DOB: data.user.DOB,
          isAuthorized: true,
          rights: userRights
        }
      });

      const maxAge = rememberMe 
        ? 60 * 60 * 24 * 30 // 30 jours
        : 60 * 60 * 24;     // 24 heures

      // Détection intelligente pour secure cookies
      const isSecure = process.env.NODE_ENV === 'production' && 
                      (request.headers.get('x-forwarded-proto') === 'https' || 
                       request.url.startsWith('https://'));

      responseJson.cookies.set({
        name: COOKIE_NAMES.TEAMR_TOKEN,
        value: data.token,
        httpOnly: true,     // On garde le JWT sécurisé
        secure: isSecure,   // Secure seulement en production avec HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge
      });

      responseJson.cookies.set({
        name: 'teamr_userId',
        value: decodedToken.userId,
        httpOnly: false,    // Accessible côté client
        secure: isSecure,   // Secure seulement en production avec HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge
      });

      // Logger la connexion réussie
      await logConnexion(decodedToken.userId, email, true);

      return responseJson;
    } catch (error) {
      // Logger la tentative de connexion échouée
      // On ne peut pas avoir le userId ici, on utilise l'email comme identifiant
      try {
        await logConnexion('unknown', email, false);
      } catch (logError) {
        console.error('Erreur lors du logging de la connexion échouée:', logError);
      }
      
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