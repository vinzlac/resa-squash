import { executeQuery } from '@/app/lib/db';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function isAuthorizedEmail(email: string): Promise<boolean> {
  try {
    if (!email || !emailRegex.test(email)) {
      return false;
    }

    const result = await executeQuery(
      'SELECT email FROM authorized_users WHERE email = $1',
      [email]
    );
    
    return result.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation:', error);
    return false;
  }
} 