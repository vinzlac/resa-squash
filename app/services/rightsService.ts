import { executeQuery } from '@/app/lib/db';
import { UserRight, UserRights, UserWithName } from '@/app/types/rights';
import { licenseesMapByEmail } from '@/app/services/common';

// Create a new migration for user_rights table
// CREATE TABLE IF NOT EXISTS user_rights (
//   user_id VARCHAR(255) PRIMARY KEY,
//   rights JSONB NOT NULL DEFAULT '[]'::jsonb,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

export async function getAuthorizedUsersWithNames(): Promise<UserWithName[]> {
  // Récupérer uniquement les emails des utilisateurs autorisés
  const result = await executeQuery(
    'SELECT email FROM authorized_users ORDER BY email ASC'
  );
  
  const authorizedUsers: UserWithName[] = [];
  
  // Utiliser la map licenseesMapByEmail pour enrichir les données
  for (const row of result) {
    const email = row.email;
    const licensee = licenseesMapByEmail.get(email);
    
    // Ne garder que les utilisateurs qui existent dans la map
    if (licensee && licensee.user && licensee.user.length > 0) {
      const user = licensee.user[0];
      authorizedUsers.push({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: email
      });
    }
  }
  
  // Trier par nom puis prénom
  return authorizedUsers.sort((a, b) => {
    if (a.lastName !== b.lastName) {
      return a.lastName.localeCompare(b.lastName);
    }
    return a.firstName.localeCompare(b.firstName);
  });
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