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

// Définir le chemin relatif correct
const LICENCIES_FILE = path.join(process.cwd(), "public/allLicencies.json");
// ou
// const LICENCIES_FILE = "./allLicencies.json"; // si le fichier est dans le même dossier

// Fonction pour charger ou récupérer les licenciés
export async function getLicencies(token: string): Promise<
  Map<string, { firstName: string; lastName: string }>
> {
  console.log("getLicencies");
  try {
    console.log("📂 Chargement des licenciés depuis le fichier local...");
    const data = await fs.readFile(LICENCIES_FILE, "utf-8");

    const licenseeMap = new Map<
      string,
      { firstName: string; lastName: string }
    >();

    JSON.parse(data).forEach((licencie: TrLicensee) => {
      if (licencie.user.length > 0) {
        const user = licencie.user[0];
        licenseeMap.set(user._id, {
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }
    });

    return licenseeMap;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("🔄 Fichier non trouvé. Récupération depuis l'API...");
      return await fetchAllLicensees(token);
    } else {
      throw error;
    }
  }
}

// Fonction pour récupérer tous les licenciés depuis l'API et les enregistrer en cache
async function fetchAllLicensees(token: string): Promise<
  Map<string, { firstName: string; lastName: string }>
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
  const licenseeMap = new Map<
    string,
    { firstName: string; lastName: string }
  >();

  data.forEach((licencie) => {
    if (licencie.user.length > 0) {
      const user = licencie.user[0];
      licenseeMap.set(user._id, {
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  });

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
  const licenseeMap = await getLicencies(token);
  console.log("licenseeMap size : ", licenseeMap.size);
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

    const slots: TimeSlot[] = sortedSessions.map((session) => ({
      time: session.time,
      endTime: session.endTime,
      isAvailable: session.yesParticipants.length === 0,
      sessionId: session._id,
      participants: session.yesParticipants.map((userId) => {
        const user = licenseeMap.get(userId) || {
          firstName: "Inconnu",
          lastName: "Inconnu",
        };
        return {
          id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }),
    }));

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
        code: ErrorCode.SLOT_ALREADY_BOOKED,
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
              lastName: participant.lastName
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

  return response.json();
}