import { sql as vercelSql } from "@vercel/postgres";
import { Pool } from 'pg';
import { cache } from "react";
import { Licensee } from '@/app/types/licensee';

// Log des variables d'environnement au démarrage

console.log("Environment variables:");
console.log("DATABASE_TYPE:", process.env.DATABASE_TYPE);
console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
console.log("POSTGRES_DATABASE:", process.env.POSTGRES_DATABASE);
console.log("POSTGRES_PASSWORD:", process.env.POSTGRES_PASSWORD);
console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
console.log("POSTGRES_PRISMA_URL:", process.env.POSTGRES_PRISMA_URL);
console.log("POSTGRES_URL_NON_POOLING:", process.env.POSTGRES_URL_NON_POOLING);

// Configuration pour PostgreSQL local
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export const db = pool;

// Fonction utilitaire pour exécuter des requêtes SQL
export async function executeQuery(
  query: string,
  params: Array<string | number> = []
) {
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

export const getFavorites = cache(async (userId: string) => {
  try {
    const rows = await executeQuery(
      "SELECT licensee_id FROM favorites WHERE user_id = $1",
      [userId]
    );
    return rows.map((row) => row.licensee_id);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
});


export async function addFavorite(userId: string, licenseeId: string) {
  try {
    await executeQuery(
      "INSERT INTO favorites (user_id, licensee_id) VALUES ($1, $2) ON CONFLICT (user_id, licensee_id) DO NOTHING",
      [userId, licenseeId]
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
}

export async function removeFavorite(userId: string, licenseeId: string) {
  try {
    await executeQuery(
      "DELETE FROM favorites WHERE user_id = $1 AND licensee_id = $2",
      [userId, licenseeId]
    );
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}

// Fonction pour enregistrer une création de réservation
export async function createReservationIntoDB(
  userId: string,
  sessionId: string,
  mainUserId: string,
  partnerId: string,
  startDate: Date
) {
  try {
    await executeQuery(
      "INSERT INTO reservations (user_id, session_id, main_user_id, partner_id, start_date) VALUES ($1, $2, $3, $4, $5)",
      [userId, sessionId, mainUserId, partnerId, startDate.toISOString()]
    );
  } catch (error) {
    console.error(`Error logging reservation creation:`, error);
    // Ne pas propager l'erreur pour ne pas bloquer le flux principal
  }
}

// Fonction pour enregistrer une suppression de réservation
export async function removeReservationIntoDB(sessionId: string) {
  try {
    await executeQuery(
      "DELETE FROM reservations WHERE session_id = $1",
      [sessionId]
    );
  } catch (error) {
    console.error(`Error logging reservation deletion:`, error);
    // Ne pas propager l'erreur pour ne pas bloquer le flux principal
  }
}

// Fonction pour récupérer tous les licenciés depuis la base de données
export async function getAllLicensees(): Promise<Licensee[]> {
  try {
    const dbLicensees = await executeQuery(`
      SELECT userId, email, firstName, lastName
      FROM licensees
      ORDER BY lastName, firstName
    `);
    
    // Normaliser les noms de champs pour correspondre au format attendu
    const licensees: Licensee[] = dbLicensees.map(licensee => ({
      userId: licensee.userid || licensee.userId,
      email: licensee.email,
      firstName: licensee.firstname || licensee.firstName,
      lastName: licensee.lastname || licensee.lastName
    }));
    
    return licensees;
  } catch (error) {
    console.error('Erreur lors de la récupération des licenciés:', error);
    throw error;
  }
}
