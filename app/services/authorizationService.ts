import { executeQuery } from '@/app/lib/db';
import { AuthorizedUsersResponse } from '@/app/types/auth';
import { AUTH_ERRORS } from '@/app/constants/errors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getAuthorizedUsers(): Promise<AuthorizedUsersResponse> {
  const result = await executeQuery(
    'SELECT email FROM authorized_users ORDER BY email ASC'
  );
  return { emails: result.map(row => row.email) };
}

export async function addAuthorizedUser(email: string): Promise<void> {
  if (!email || !emailRegex.test(email)) {
    throw new Error(AUTH_ERRORS.INVALID_EMAIL);
  }
  await executeQuery(
    'INSERT INTO authorized_users (email) VALUES ($1) ON CONFLICT DO NOTHING',
    [email]
  );
}

export async function removeAuthorizedUser(email: string): Promise<void> {
  if (!email || !emailRegex.test(email)) {
    throw new Error('Email invalide');
  }
  await executeQuery(
    'DELETE FROM authorized_users WHERE email = $1',
    [email]
  );
} 