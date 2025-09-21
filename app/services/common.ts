
import {
  GET_LICENSEE_URL,
  BOOKING_URL,
  COURT_CLUB_IDS,
  GET_SESSION_URL,
  GET_BOOKINGS_URL,
  CUSTOM_ID,
  COORDINATES,
  TEAMR_AUTH_URL,
  interpolateUrl,
} from "./config";
import { TrSession, TrBookingResponse, TrTransaction, TrNoCreditsError, TrBooking } from "./teamrTypes";

import { DayPlanning, CourtPlanning, TimeSlot } from "./types.js";
import { Reservation } from '@/app/types/reservation';
import { TeamRAuthRequest, TeamRAuthResponse } from '@/app/types/teamr';
import { buildTeamRHeader } from '@/app/utils/auth';
import { ErrorCode, ApiError } from '@/app/types/errors';
import { TrLicensee as TrLicenseeFromTypes } from '@/app/types/TrLicencees';
import { Licensee } from '@/app/types/licensee';
import { getAllLicensees } from '@/app/lib/db';
import { Booking } from '@/app/types/booking';

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

export async function getLicenciesMapByUserId(): Promise<Map<string, Licensee>> {
  console.log("getLicenciesMapByUserId");
  
  
  try {
    console.log("📂 Chargement des licenciés depuis la base de données...");
    const licensees = await getAllLicensees();

    const licenseeMap = new Map<string, Licensee>();

    licensees.forEach((licensee) => {
      licenseeMap.set(licensee.userId, {
        userId: licensee.userId,
        firstName: licensee.firstName,
        lastName: licensee.lastName,
        email: licensee.email
      });
    });

    console.log("final licenseeMap size : ", licenseeMap.size);
    return licenseeMap;
  } catch (error) {
    console.error("Erreur lors du chargement des licenciés depuis la base de données:", error);
    return new Map();
  }
}

// Fonction pour récupérer tous les licenciés depuis l'API avec l'email comme clé
export async function fetchAllLicenseesByEmail(token: string): Promise<
  Map<string, TrLicenseeFromTypes>
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

  const data = (await response.json()) as TrLicenseeFromTypes[];
  const licenseeMap = new Map<string, TrLicenseeFromTypes>();

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
  
  const payload = {
    filters: { clubId, coordinates: COORDINATES, date },
    coordinates: COORDINATES,
    customId: CUSTOM_ID,
  };
  console.log("📤 fetchSessionsForCourt - Payload envoyé:", JSON.stringify(payload, null, 2));
  
  const response = await fetch(GET_SESSION_URL, {
    method: "POST",
    headers: buildTeamRHeader(token),
    body: JSON.stringify(payload),
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
  const licenseeMapByUserId = await getLicenciesMapByUserId();
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
          const user = licensee ? licensee : {
            userId: userId,
            firstName: "Inconnu",
            lastName: "Inconnu",
            email: ""
          };
          
          return {
            id: user.userId,
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

// Fonction utilitaire pour vérifier si la réponse est une erreur noCredits
function isNoCreditsError(responseText: string): TrNoCreditsError | null {
  try {
    const parsed = JSON.parse(responseText);
    if (parsed && typeof parsed === 'object' && 
        'status' in parsed && 'name' in parsed && 'message' in parsed) {
      return parsed as TrNoCreditsError;
    }
  } catch {
    // Si ce n'est pas du JSON valide, ce n'est pas une erreur noCredits
  }
  return null;
}

export async function bookSession(
  sessionId: string,
  userId: string,
  friendUserId: string,
  token: string
): Promise<TrBookingResponse> {
  try {
    const payload = {
      participant: {
        userId: userId,
        isPresent: "yes",
        coordinates: [2.5864862369264747, 48.869659697477495],
        friendUserId: friendUserId,
      },
      sessionId: sessionId,
      customId: CUSTOM_ID,
    };

    console.log("📤 bookSession - Payload envoyé:", JSON.stringify(payload, null, 2));
    const body = JSON.stringify(payload);

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

    // Vérifier si c'est une erreur de type noCredits
    const noCreditsError = isNoCreditsError(responseText);
    if (noCreditsError) {
      throw {
        code: ErrorCode.INVALID_PARAMETER,
        message: `${noCreditsError.message} (${noCreditsError.status})`
      } as ApiError;
    }

    // Si ce n'est pas "already booked" ni "noCredits", on essaie de parser le JSON
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    return responseText ? JSON.parse(responseText) : { 
      session: {} as TrSession, 
      transaction: {} as TrTransaction, 
      friendTransaction: {} as TrTransaction 
    } as TrBookingResponse;
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
    console.log('deleteBookSession - Paramètres reçus:', {
      sessionId,
      userId,
      friendUserId,
      token: token ? 'présent' : 'absent'
    });

    const payload = {
      participant: {
        userId: userId,
        isPresent: "no",
        coordinates: [2.5864862369264747, 48.869659697477495],
        friendUserId: friendUserId,
      },
      sessionId: sessionId,
      customId: CUSTOM_ID,
    };

    console.log("📤 deleteBookSession - Payload envoyé:", JSON.stringify(payload, null, 2));
    const body = JSON.stringify(payload);

    const response = await fetch(BOOKING_URL, {
      method: "POST",
      headers: buildTeamRHeader(token),
      body: body,
    });

    console.log('deleteBookSession - Réponse HTTP:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('deleteBookSession - Réponse brute:', responseText);

    if (!response.ok) {
      // Gestion spécifique des erreurs courantes
      if (response.status === 404) {
        throw {
          code: ErrorCode.NOT_FOUND,
          message: 'La réservation n\'existe pas ou a déjà été supprimée'
        } as ApiError;
      }
      
      if (response.status === 403) {
        throw {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Vous n\'avez pas les droits pour supprimer cette réservation'
        } as ApiError;
      }

      // Pour les autres erreurs, on renvoie le message d'erreur de l'API si disponible
      throw {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: responseText || 'Erreur lors de la suppression de la réservation'
      } as ApiError;
    }

    // Si la réponse est vide mais le status est OK, on considère que c'est un succès
    if (!responseText) {
      return { 
        session: {} as TrSession, 
        transaction: {} as TrTransaction, 
        friendTransaction: {} as TrTransaction 
      } as TrBookingResponse;
    }

    try {
      const responseData = JSON.parse(responseText);
      console.log('deleteBookSession - Données de réponse:', responseData);
      return responseData;
    } catch (parseError) {
      console.warn('deleteBookSession - Impossible de parser la réponse JSON:', parseError);
      // Si on ne peut pas parser la réponse mais que le status est OK, on considère que c'est un succès
      return { 
        session: {} as TrSession, 
        transaction: {} as TrTransaction, 
        friendTransaction: {} as TrTransaction 
      } as TrBookingResponse;
    }
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

  // Log du payload sans afficher le mot de passe en clair pour des raisons de sécurité
  const logPayload = {
    ...authRequest,
    credentials: { 
      email: authRequest.credentials.email, 
      password: '***' 
    }
  };
  console.log("📤 authenticateUser - Payload envoyé:", JSON.stringify(logPayload, null, 2));

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
  
  return authResponse;
}

export async function getBookings(
  userId: string,
  token: string,
  fromDate?: string
): Promise<Booking[]> {
  try {
    console.log("getBookings for userId:", userId);
    
    // Construire l'URL avec les paramètres
    const baseUrl = interpolateUrl(GET_BOOKINGS_URL, { userId });
    const params = new URLSearchParams({
      category: '',
      temporality: 'fromToday'
    });
    
    // Ajouter le paramètre fromDate si fourni
    if (fromDate) {
      params.append('fromDate', fromDate);
    }
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log("📤 getBookings - URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: buildTeamRHeader(token),
    });

    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status} lors de la récupération des bookings`);
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const bookings: TrBooking[] = await response.json();
    console.log("📥 getBookings - Réponse reçue:", bookings.length, "bookings");

    // Transformer les données TeamR en format de notre API
    const transformedBookings: Booking[] = bookings.map((booking) => {
      const session = booking.session[0]; // Prendre la première session
      const attendees = session?.attendees || [];
      
      // Trouver le userId principal (celui qui correspond au paramètre userId)
      const mainUser = attendees.find(attendee => attendee.userId === userId);
      // Trouver le partenaire (l'autre utilisateur)
      const partner = attendees.find(attendee => attendee.userId !== userId);
      
      return {
        bookingId: booking._id,
        sessionId: booking.sessionId,
        userId: mainUser?.userId || userId,
        partnerId: partner?.userId || booking.friendUserId,
        startDate: session?.date || '',
        clubId: booking.clubId
      };
    });

    console.log("📤 getBookings - Bookings transformés:", transformedBookings.length);
    return transformedBookings;
  } catch (error) {
    console.error("Erreur lors de la récupération des bookings:", error);
    throw error;
  }
}
