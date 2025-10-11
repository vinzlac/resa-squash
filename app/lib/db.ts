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
  params: Array<string | number | boolean> = []
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
  bookingActionUserId: string,
  sessionId: string,
  userId: string,
  partnerId: string,
  startDate: Date,
  clubId: string
) {
  try {
    await executeQuery(
      "INSERT INTO reservations (booking_action_user_id, session_id, user_id, partner_id, start_date, club_id, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [bookingActionUserId, sessionId, userId, partnerId, startDate.toISOString(), clubId, false]
    );
  } catch (error) {
    console.error(`Error logging reservation creation:`, error);
    // Ne pas propager l'erreur pour ne pas bloquer le flux principal
  }
}

// Fonction pour enregistrer une suppression de réservation (suppression logique)
export async function removeReservationIntoDB(sessionId: string) {
  try {
    await executeQuery(
      "UPDATE reservations SET deleted = TRUE WHERE session_id = $1",
      [sessionId]
    );
    console.log(`✅ Réservation ${sessionId} marquée comme supprimée logiquement`);
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

// Fonction pour logger une action utilisateur
export async function logAction(
  userId: string,
  actionType: string,
  actionResult: string,
  actionDetails: Record<string, unknown>
) {
  try {
    await executeQuery(
      `INSERT INTO action_log (user_id, action_type, action_result, action_timestamp, action_details) 
       VALUES ($1, $2::action_type, $3::action_result, $4, $5)`,
      [userId, actionType, actionResult, new Date().toISOString(), JSON.stringify(actionDetails)]
    );
    console.log(`📝 Action loggée: ${actionType} - ${actionResult}`);
  } catch (error) {
    console.error('Erreur lors du logging de l\'action:', error);
    // Ne pas propager l'erreur pour ne pas bloquer le flux principal
  }
}

// Fonctions spécifiques pour chaque type d'action
export async function logConnexion(userId: string, email: string, success: boolean) {
  await logAction(
    userId,
    'CONNEXION',
    success ? 'SUCCESS' : 'FAILED',
    { email }
  );
}

export async function logAddBooking(
  userId: string,
  court: number,
  date: string,
  time: string,
  userIds: string[],
  success: boolean
) {
  await logAction(
    userId,
    'ADD_BOOKING',
    success ? 'SUCCESS' : 'FAILED',
    { court, date, time, userIds }
  );
}

export async function logDeleteBooking(
  userId: string,
  court: number,
  date: string,
  time: string,
  userIds: string[],
  success: boolean
) {
  await logAction(
    userId,
    'DELETE_BOOKING',
    success ? 'SUCCESS' : 'FAILED',
    { court, date, time, userIds }
  );
}
