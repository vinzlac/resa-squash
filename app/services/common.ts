import fs from "fs/promises";
import {
  GET_LICENSEE_URL,
  BOOKING_URL,
  COURT_CLUB_IDS,
  GET_SESSION_URL,
  CUSTOM_ID,
  COORDINATES,
  TEAMR_AUTH_URL,
} from "./config";
import { TrLicensee, TrSession, TrBookingResponse } from "./teamrTypes";
import path from "path";
import { DayPlanning, CourtPlanning, TimeSlot } from "./types.js";
import { Reservation } from '@/app/types/reservation';
import { TeamRAuthRequest, TeamRAuthResponse } from '@/app/types/teamr';
import { buildTeamRHeader } from '@/app/utils/auth';
import { ErrorCode, ApiError } from '@/app/types/errors';
import { Licensee } from '@/app/types/licensee';

// Variable statique pour stocker la map des licenciés par email
export let licenseesMapByEmail: Map<string, Licensee> = new Map();

// Variable statique pour stocker la map des licenciés par userId
export let licenseesMapByUserId: Map<string, Licensee> = new Map();

// Variable pour stocker le token
let globalTeamrToken: string | undefined;

// Fonction pour définir le token global
export function setGlobalTeamrToken(token: string): void {
  globalTeamrToken = token;
}

// Fonction pour récupérer le token global
export function getGlobalTeamrToken(): string | undefined {
  return globalTeamrToken;
}

// Définir le chemin relatif correct
const LICENCIES_FILE = path.join(process.cwd(), "public/allLicencies.json");
// ou
// const LICENCIES_FILE = "./allLicencies.json"; // si le fichier est dans le même dossier

// Fonction pour charger ou récupérer les licenciés
export async function getLicenciesMapByUserId(token: string): Promise<Map<string, Licensee>> {
  console.log("getLicenciesMapByUserId");
  
  // Si la map statique est déjà remplie, on la retourne directement
  if (licenseesMapByUserId.size > 0) {
    console.log("📂 Utilisation de la map en mémoire...");
    return licenseesMapByUserId;
  }
  
  try {
    console.log("📂 Chargement des licenciés depuis le fichier local...");
    const data = await fs.readFile(LICENCIES_FILE, "utf-8");

    const licenseeMap = new Map<string, Licensee>();

    JSON.parse(data).forEach((licencie: TrLicensee) => {
      if (licencie.user.length > 0) {
        const user = licencie.user[0];
        licenseeMap.set(user._id, {
          user: [{
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }]
        });
      }
    });

    // Mettre à jour la map statique
    licenseesMapByUserId = licenseeMap;

    console.log("final licenseesMapByUserId size : ", licenseesMapByUserId.size);
    return licenseeMap;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("🔄 Fichier non trouvé. Récupération depuis l'API...");
      const licenseeMap = await fetchAllLicenseesByUserId(token);
      // Mettre à jour la map statique
      licenseesMapByUserId = licenseeMap;
      console.log("final licenseesMapByUserId size : ", licenseesMapByUserId.size);
      return licenseeMap;
    } else {
      throw error;
    }
  }
}

// Fonction pour charger ou récupérer les licenciés avec l'email comme clé
export async function getLicenciesMapByEmail(token: string): Promise<
  Map<string, Licensee>
> {
  console.log("getLicenciesMapByEmail");
  
  // Si la map statique est déjà remplie, on la retourne directement
  if (licenseesMapByEmail.size > 0) {
    console.log("📂 Utilisation de la map en mémoire...");
    return licenseesMapByEmail;
  }
  
  try {
    console.log("📂 Chargement des licenciés depuis le fichier local...");
    const data = await fs.readFile(LICENCIES_FILE, "utf-8");

    const licenseeMap = new Map<string, Licensee>();

    JSON.parse(data).forEach((licencie: TrLicensee) => {
      if (licencie.user.length > 0) {
        const user = licencie.user[0];
        if (user.email) { // Vérifier que l'email existe
          licenseeMap.set(user.email, {
            user: [{
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }]
          });
        }
      }
    });

    // Mettre à jour la map statique
    licenseesMapByEmail = licenseeMap;

    console.log("final licenseesMapByEmail size : ", licenseesMapByEmail.size);
    return licenseeMap;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("🔄 Fichier non trouvé. Récupération depuis l'API...");
      const licenseeMap = await fetchAllLicenseesByEmail(token);
      console.log("final licenseesMapByEmail size : ", licenseeMap.size);
      return licenseeMap;
    } else {
      throw error;
    }
  }
}

// Fonction pour récupérer tous les licenciés depuis l'API et les enregistrer en cache
async function fetchAllLicenseesByUserId(token: string): Promise<
  Map<string, Licensee>
> {
  const firstClubId = Object.values(COURT_CLUB_IDS)[0];
  const url = `${GET_LICENSEE_URL}/${firstClubId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildTeamRHeader(token),
  });

  if (!response.ok) {
    console.error(
      `❌ Erreur HTTP ${response.status} lors de la récupération des licenciés.`
    );
    return new Map();
  }

  const data = (await response.json()) as TrLicensee[];
  const licenseeMap = new Map<string, Licensee>();

  data.forEach((licencie) => {
    if (licencie.user.length > 0) {
      const user = licencie.user[0];
      licenseeMap.set(user._id, {
        user: [{
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }]
      });
    }
  });

  return licenseeMap;
}

// Fonction pour récupérer tous les licenciés depuis l'API avec l'email comme clé
async function fetchAllLicenseesByEmail(token: string): Promise<
  Map<string, Licensee>
> {
  console.log("fetchAllLicenseesByEmail calling url : ", GET_LICENSEE_URL);
  const firstClubId = Object.values(COURT_CLUB_IDS)[0];
  const url = `${GET_LICENSEE_URL}/${firstClubId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildTeamRHeader(token),
  });

  if (!response.ok) {
    console.error(
      `❌ Erreur HTTP ${response.status} lors de la récupération des licenciés.`
    );
    return new Map();
  }

  const data = (await response.json()) as TrLicensee[];
  const licenseeMap = new Map<string, Licensee>();

  data.forEach((licencie) => {
    if (licencie.user.length > 0) {
      const user = licencie.user[0];
      if (user.email) { // Vérifier que l'email existe
        licenseeMap.set(user.email, {
          user: [{
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }]
        });
      }
    }
  });

  // Mettre à jour la map statique
  licenseesMapByEmail = licenseeMap;
  return licenseeMap;
}

// Fonction pour récupérer les sessions d'un court donné
export async function fetchSessionsForCourt(
  clubId: string,
  date: string,
  token: string
): Promise<TrSession[]> {

  console.log("fetchSessionsForCourt for clubId : ", clubId);
  console.log("fetchSessionsForCourt for date : ", date);
  const response = await fetch(GET_SESSION_URL, {
    method: "POST",
    headers: buildTeamRHeader(token),
    body: JSON.stringify({
      filters: { clubId, coordinates: COORDINATES, date },
      coordinates: COORDINATES,
      customId: CUSTOM_ID,
    }),
  });

  console.log("called url : ", GET_SESSION_URL);

  if (!response.ok) {
    console.error(
      `❌ Erreur HTTP ${response.status} pour le clubId: ${clubId}`
    );
    return [];
  }

  const trSessions = (await response.json()) as TrSession[];
  console.log(
    "Sessions IDs:",
    trSessions.map((session) => session._id)
  );
  return trSessions;
}

// Fonction pour récupérer le planning complet
export async function fetchPlanning(date: string, token: string): Promise<DayPlanning> {
  console.log("fetchPlanning for DATE : ", date);
  const licenseeMapByUserId = await getLicenciesMapByUserId(token);
  console.log("licenseeMap size : ", licenseeMapByUserId.size);
  const courts: CourtPlanning[] = [];

  for (const [courtNumber, clubId] of Object.entries(COURT_CLUB_IDS)) {
    console.log("clubId : ", clubId);
    console.log("courtNumber : ", courtNumber);

    const sessions = await fetchSessionsForCourt(clubId, date, token);
    console.log("sessions count : ", sessions.length);

    // Trier les sessions par heure
    const sortedSessions = sessions.sort((a, b) => {
      const timeA = parseInt(a.time.replace("H", ""));
      const timeB = parseInt(b.time.replace("H", ""));
      return timeA - timeB;
    });

    const slots: TimeSlot[] = sortedSessions.map((session) => {
      // Fusionner les deux tableaux de participants en éliminant les doublons
      const allParticipantIds = [...new Set([...session.participants, ...session.yesParticipants])];
      
      return {
        time: session.time,
        endTime: session.endTime,
        isAvailable: session.participants.length === 0 && session.yesParticipants.length === 0,
        sessionId: session._id,
        participants: allParticipantIds.map((userId) => {
          const licensee = licenseeMapByUserId.get(userId);
          const user = licensee ? licensee.user[0] : {
            _id: userId,
            firstName: "Inconnu",
            lastName: "Inconnu",
            email: ""
          };
          
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            yes: session.yesParticipants.includes(userId)
          };
        }),
      };
    });

    courts.push({
      courtNumber,
      slots,
    });
  }

  return {
    date,
    courts,
  };
}

export async function bookSession(
  sessionId: string,
  userId: string,
  friendUserId: string,
  token: string
): Promise<TrBookingResponse> {
  try {
    const body = JSON.stringify({
      participant: {
        userId: userId,
        isPresent: "yes",
        coordinates: [2.5864862369264747, 48.869659697477495],
        friendUserId: friendUserId,
      },
      sessionId: sessionId,
      customId: CUSTOM_ID,
    });

    const response = await fetch(BOOKING_URL, {
      method: "POST",
      headers: buildTeamRHeader(token),
      body: body,
    });

    const responseText = await response.text();
    
    // Vérifier si la réponse contient "already booked"
    if (responseText.includes("already booked")) {
      throw {
        code: ErrorCode.INVALID_PARAMETER,
        message: responseText
      } as ApiError;
    }

    // Si ce n'est pas "already booked", on essaie de parser le JSON
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    throw error;
  }
}

export async function deleteBookSession(
  sessionId: string,
  userId: string,
  friendUserId: string,
  token: string
): Promise<TrBookingResponse> {
  try {
    const body = JSON.stringify({
      participant: {
        userId: userId,
        isPresent: "no",
        coordinates: [2.5864862369264747, 48.869659697477495],
        friendUserId: friendUserId,
      },
      sessionId: sessionId,
      customId: CUSTOM_ID,
    });

    const response = await fetch(BOOKING_URL, {
      method: "POST",
      headers: buildTeamRHeader(token),
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation :", error);
    throw error;
  }
}

export async function getDailyReservations(date: string, token: string): Promise<Reservation[]> {
  console.log("getDailyReservations for DATE : ", date);
  const reservations: Reservation[] = [];
  const planning = await fetchPlanning(date, token);

  console.log("PLANNING : ", planning);
  planning.courts.forEach(court => {
    court.slots.forEach(slot => {
      reservations.push({
        id: slot.sessionId,
        court: parseInt(court.courtNumber),
        time: slot.time,
        endTime: slot.endTime,
        date: planning.date,
        available: slot.isAvailable,
        participants: slot.participants.length,
        users: slot.isAvailable 
          ? [] 
          : slot.participants.map(participant => ({
              id: participant.id,
              firstName: participant.firstName,
              lastName: participant.lastName,
              email: participant.email,
              yes: participant.yes
            }))
      });
    });
  });

  return reservations;
}

export async function authenticateUser(email: string, password: string): Promise<TeamRAuthResponse> {
  const authRequest: TeamRAuthRequest = {
    credentials: { email, password },
    customId: CUSTOM_ID,
    deviceInfo: {
      os: 'iOS 18.3.1',
      model: 'iPhone 12 Pro',
      brand: 'Apple',
      version: '3.0.20',
    },
    coachAuthentication: false,
  };

  const response = await fetch(TEAMR_AUTH_URL, {
    method: 'POST',
    headers: buildTeamRHeader(),
    body: JSON.stringify(authRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur d\'authentification TeamR');
  }

  const authResponse = await response.json();
  
  // Stocker le token global
  setGlobalTeamrToken(authResponse.token);
  
  // Initialiser les maps des licenciés après l'authentification
  console.log("🔄 Initialisation des maps des licenciés...");
  await Promise.all([
    getLicenciesMapByEmail(authResponse.token),
    getLicenciesMapByUserId(authResponse.token)
  ]);
  console.log(`✅ Map des licenciés par email initialisée avec ${licenseesMapByEmail.size} entrées`);
  console.log(`✅ Map des licenciés par userId initialisée avec ${licenseesMapByUserId.size} entrées`);
  
  return authResponse;
}

// Fonction pour s'assurer que la map est initialisée
export async function ensureLicenseesMapByEmailIsInitialized(tokenParam?: string): Promise<void> {
  console.log("tokenParam : ", tokenParam);
  console.log("Vérification de l'initialisation de licenseesMapByEmail...");
  console.log("Taille actuelle: ", licenseesMapByEmail.size);
  
  if (licenseesMapByEmail.size === 0) {
    // Utiliser le token passé en paramètre ou le token global
    const token = tokenParam || globalTeamrToken;

    console.log("token : ", token);
    
    if (token) {
      console.log("Initialisation de licenseesMapByEmail...");
      await getLicenciesMapByEmail(token);
      console.log("licenseesMapByEmail initialisée avec", licenseesMapByEmail.size, "entrées");
    } else {
      console.warn("Aucun token disponible pour initialiser licenseesMapByEmail");
    }
  }
}

// Fonction pour s'assurer que la map des licenciés par userId est initialisée
export async function ensureLicenseesMapByUserIdIsInitialized(tokenParam?: string): Promise<void> {
  console.log("Vérification de l'initialisation de licenseesMapByUserId...");
  console.log("Taille actuelle: ", licenseesMapByUserId.size);
  
  if (licenseesMapByUserId.size === 0) {
    // Utiliser le token passé en paramètre ou le token global
    const token = tokenParam || globalTeamrToken;
    
    if (token) {
      console.log("Initialisation de licenseesMapByUserId...");
      await getLicenciesMapByUserId(token);
      console.log("licenseesMapByUserId initialisée avec", licenseesMapByUserId.size, "entrées");
    } else {
      console.warn("Aucun token disponible pour initialiser licenseesMapByUserId");
    }
  }
}