import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function migrate() {
  // Ne pas exécuter en local
  if (process.env.DATABASE_TYPE !== 'vercel') {
    console.log('Skipping migration in local environment');
    return;
  }

  try {
    // Lire le contenu du fichier SQL
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'migrations', '001_create_favorites.sql'),
      'utf-8'
    );

    // Exécuter la migration
    await sql.query(sqlContent);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 