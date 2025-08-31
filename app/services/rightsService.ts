import { executeQuery } from '@/app/lib/db';
import { UserRight, UserRights } from '@/app/types/rights';
import { Licensee } from '@/app/types/licensee';

// Create a new migration for user_rights table
// CREATE TABLE IF NOT EXISTS user_rights (
//   user_id VARCHAR(255) PRIMARY KEY,
//   rights JSONB NOT NULL DEFAULT '[]'::jsonb,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

export async function getAuthorizedUsersWithNames(): Promise<Licensee[]> {
  try {
    // Faire une jointure directe entre authorized_users et licensees
    const result = await executeQuery(`
      SELECT 
        l.userId,
        l.email,
        l.firstName, 
        l.lastName
      FROM authorized_users au
      INNER JOIN licensees l ON au.email = l.email
      ORDER BY l.lastName ASC, l.firstName ASC
    `);
    
    console.log(`Nombre d'utilisateurs autorisés trouvés: ${result.length}`);
    
    // Normaliser les noms de champs pour correspondre au format attendu
    return result.map(row => ({
      userId: row.userid || row.userId,
      email: row.email,
      firstName: row.firstname || row.firstName,
      lastName: row.lastname || row.lastName
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs autorisés:', error);
    return [];
  }
}

export async function getUserRights(userId: string): Promise<UserRight[]> {
  try {
    const result = await executeQuery(
      'SELECT rights FROM user_rights WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return [];
    }
    
    return result[0].rights;
  } catch (error) {
    console.error('Error fetching user rights:', error);
    return [];
  }
}

export async function addUserRight(userId: string, right: UserRight): Promise<void> {
  try {
    // Check if user already has rights
    const existingRights = await getUserRights(userId);
    
    // If user already has this right, do nothing
    if (existingRights.includes(right)) {
      return;
    }
    
    const updatedRights = [...existingRights, right];
    
    await executeQuery(
      `INSERT INTO user_rights (user_id, rights) 
       VALUES ($1, $2::jsonb) 
       ON CONFLICT (user_id) 
       DO UPDATE SET rights = $2::jsonb, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(updatedRights)]
    );
  } catch (error) {
    console.error('Error adding user right:', error);
    throw error;
  }
}

export async function removeUserRight(userId: string, right: UserRight): Promise<void> {
  try {
    // Get existing rights
    const existingRights = await getUserRights(userId);
    
    // If user doesn't have this right, do nothing
    if (!existingRights.includes(right)) {
      return;
    }
    
    const updatedRights = existingRights.filter(r => r !== right);
    
    await executeQuery(
      `UPDATE user_rights 
       SET rights = $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, JSON.stringify(updatedRights)]
    );
  } catch (error) {
    console.error('Error removing user right:', error);
    throw error;
  }
}

export async function getAllUserRights(): Promise<UserRights[]> {
  try {
    const result = await executeQuery(
      'SELECT user_id, rights FROM user_rights'
    );
    
    return result.map(row => ({
      userId: row.user_id,
      rights: row.rights
    }));
  } catch (error) {
    console.error('Error fetching all user rights:', error);
    return [];
  }
} 