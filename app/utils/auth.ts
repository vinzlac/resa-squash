import { NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/app/constants/cookies';
import { jwtDecode } from 'jwt-decode';
import { TeamRDecodedJwtToken } from '@/app/types/auth';

export function extractTeamrToken(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_NAMES.TEAMR_TOKEN)?.value;
}

export function extractConnectedUserId(request: NextRequest): string | null {
  try {
    // Récupérer l'ID d'utilisateur depuis les cookies
    const userId = request.cookies.get(COOKIE_NAMES.TEAMR_USER_ID)?.value;
    return userId || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID utilisateur connecté:', error);
    return null;
  }
}

export function buildTeamRHeader(token?: string): HeadersInit {
  return {
    'Host': 'app.teamr.eu',
    'Content-Type': 'application/json',
    'User-Agent': 'HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export function decodeTeamRJwtToken(token: string): TeamRDecodedJwtToken {
  try {
    return jwtDecode<TeamRDecodedJwtToken>(token);
  } catch (error: unknown) {
    console.error('Error decoding TeamR JWT token:', error);
    throw new Error(`Invalid TeamR JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 