import { cache } from 'react';
import pg from 'pg';

const pool = new pg.Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export async function createFavoritesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        licensee_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, licensee_id)
      );
    `);
  } finally {
    client.release();
  }
}

export const getFavorites = cache(async (userId: string) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT licensee_id FROM favorites WHERE user_id = $1',
      [userId]
    );
    return rows.map(row => row.licensee_id);
  } finally {
    client.release();
  }
});

export async function addFavorite(userId: string, licenseeId: string) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO favorites (user_id, licensee_id) VALUES ($1, $2) ON CONFLICT (user_id, licensee_id) DO NOTHING',
      [userId, licenseeId]
    );
  } finally {
    client.release();
  }
}

export async function removeFavorite(userId: string, licenseeId: string) {
  const client = await pool.connect();
  try {
    await client.query(
      'DELETE FROM favorites WHERE user_id = $1 AND licensee_id = $2',
      [userId, licenseeId]
    );
  } finally {
    client.release();
  }
} 