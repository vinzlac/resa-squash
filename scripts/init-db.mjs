import { config } from 'dotenv';
import pg from 'pg';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

console.log('POSTGRES_URL:', process.env.POSTGRES_URL); // Pour déboguer

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        licensee_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, licensee_id)
      );
    `);
    console.log('Table favorites created successfully');

    // Insérer quelques données de test
    await pool.query(`
      INSERT INTO favorites (user_id, licensee_id)
      VALUES ('default-user', '60bf2fdd1fd8d20020d2c8a7')
      ON CONFLICT (user_id, licensee_id) DO NOTHING;
    `);
    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init(); 