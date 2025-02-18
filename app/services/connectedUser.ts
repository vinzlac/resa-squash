import { TeamRDecodedJwtToken } from '@/app/types/auth';
import { cookies } from 'next/headers';
import { decodeTeamRJwtToken } from '@/app/utils/auth';
import { COOKIE_NAMES } from '@/app/constants/cookies';

export async function getConnectedUser(): Promise<TeamRDecodedJwtToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.TEAMR_TOKEN)?.value;
  
  if (!token) return null;
  
  try {
    return decodeTeamRJwtToken(token);
  } catch (error) {
    console.error('Error getting connected user:', error);
    return null;
  }
} 