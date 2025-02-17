import { sql as vercelSql } from "@vercel/postgres";
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration pour PostgreSQL local
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Fonction utilitaire pour exécuter des requêtes SQL
async function executeQuery(query, params = []) {
  if (process.env.DATABASE_TYPE === "vercel") {
    const result = await vercelSql.query(query, params);
    return result.rows;
  } else {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

async function migrate() {
  try {
    // Créer la table des migrations si elle n'existe pas
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id serial PRIMARY KEY,
        name varchar(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Lire tous les fichiers de migration
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Récupérer les migrations déjà exécutées
    const executedMigrations = await executeQuery(
      'SELECT name FROM migrations'
    );
    const executedMigrationNames = executedMigrations.map(row => row.name);

    // Exécuter les nouvelles migrations
    for (const file of sqlFiles) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Executing migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        await executeQuery('BEGIN');
        try {
          await executeQuery(sql);
          await executeQuery(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await executeQuery('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await executeQuery('ROLLBACK');
          throw error;
        }
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    if (process.env.DATABASE_TYPE !== "vercel") {
      await pool.end();
    }
  }
}

migrate(); 