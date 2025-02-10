import { sql as vercelSql } from '@vercel/postgres';
import pg from 'pg';
import { cache } from 'react';

// Configuration pour PostgreSQL local
const pool = new pg.Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Fonction utilitaire pour exécuter des requêtes SQL
async function executeQuery(query: string, params: Array<string | number> = []) {
  if (process.env.DATABASE_TYPE === 'vercel') {
    // Utiliser @vercel/postgres
    const result = await vercelSql.query(query, params);
    return result.rows;
  } else {
    // Utiliser pg pour la base locale
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

export const getFavorites = cache(async (userId: string) => {
  try {
    const rows = await executeQuery(
      'SELECT licensee_id FROM favorites WHERE user_id = $1',
      [userId]
    );
    return rows.map(row => row.licensee_id);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
});

export async function addFavorite(userId: string, licenseeId: string) {
  try {
    await executeQuery(
      'INSERT INTO favorites (user_id, licensee_id) VALUES ($1, $2) ON CONFLICT (user_id, licensee_id) DO NOTHING',
      [userId, licenseeId]
    );
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

export async function removeFavorite(userId: string, licenseeId: string) {
  try {
    await executeQuery(
      'DELETE FROM favorites WHERE user_id = $1 AND licensee_id = $2',
      [userId, licenseeId]
    );
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
} 