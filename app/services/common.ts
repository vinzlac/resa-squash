import fs from "fs/promises";
import { GET_LICENSEE_URL, BOOKING_URL, COURT_CLUB_IDS, GET_SESSION_URL, CUSTOM_ID, COORDINATES } from "./config";
import { TrLicensee, TrSession, TrBookingResponse } from "./teamrTypes";
import path from 'path';
import { TEAMR_CONFIG } from "../config/teamr";
import { DayPlanning, CourtPlanning, TimeSlot } from "./types.js";

// Définir le chemin relatif correct
const LICENCIES_FILE = path.join(process.cwd(), "public/allLicencies.json");
// ou
// const LICENCIES_FILE = "./allLicencies.json"; // si le fichier est dans le même dossier

// Fonction pour charger ou récupérer les licenciés
export async function getLicencies(): Promise<Map<string, { firstName: string; lastName: string }>> {
    console.log("getLicencies");
    try {
        console.log("📂 Chargement des licenciés depuis le fichier local...");
        const data = await fs.readFile(LICENCIES_FILE, "utf-8");
       
        const licenseeMap = new Map<string, { firstName: string; lastName: string }>();

        JSON.parse(data).forEach((licencie: TrLicensee) => {
            if (licencie.user.length > 0) {
                const user = licencie.user[0];
                licenseeMap.set(user._id, { firstName: user.firstName, lastName: user.lastName });
            }
        });

        return licenseeMap;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            console.log("🔄 Fichier non trouvé. Récupération depuis l'API...");
            return await fetchAllLicensees();
        } else {
            throw error;
        }
    }
}

// Fonction pour récupérer tous les licenciés depuis l'API et les enregistrer en cache
async function fetchAllLicensees(): Promise<Map<string, { firstName: string; lastName: string }>> {
    const firstClubId = Object.values(COURT_CLUB_IDS)[0];
    const url = `${GET_LICENSEE_URL}/${firstClubId}`;

    console.log("USED API KEY : ", TEAMR_CONFIG.API_KEY);
    console.log("USED BASE URL : ", TEAMR_CONFIG.BASE_URL);
    
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Host": "app.teamr.eu",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0",
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Authorization": `Bearer ${TEAMR_CONFIG.API_KEY}`
        }
    });

    if (!response.ok) {
        console.error(`❌ Erreur HTTP ${response.status} lors de la récupération des licenciés.`);
        return new Map();
    }

    const data = await response.json() as TrLicensee[];
    const licenseeMap = new Map<string, { firstName: string; lastName: string }>();

    data.forEach(licencie => {
        if (licencie.user.length > 0) {
            const user = licencie.user[0];
            licenseeMap.set(user._id, { firstName: user.firstName, lastName: user.lastName });
        }
    });

    return licenseeMap;
}

// Fonction pour récupérer les sessions d'un court donné
export async function fetchSessionsForCourt(clubId: string, date: string): Promise<TrSession[]> {
    // console.log("USED API KEY : ", TEAMR_CONFIG.API_KEY);
    // console.log("USED BASE URL : ", TEAMR_CONFIG.BASE_URL);
    console.log("fetchSessionsForCourt for clubId : ", clubId);
    console.log("fetchSessionsForCourt for date : ", date);
    const response = await fetch(GET_SESSION_URL, {
        method: "POST",
        headers: {
            "Host": "app.teamr.eu",
            "Content-Type": "application/json",
            "User-Agent": "HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Authorization": TEAMR_CONFIG.API_KEY
        },
        body: JSON.stringify({
            filters: { clubId, coordinates: COORDINATES, date },
            coordinates: COORDINATES,
            customId: CUSTOM_ID
        })
    });

    console.log("called url : ", GET_SESSION_URL);

    if (!response.ok) {
        console.error(`❌ Erreur HTTP ${response.status} pour le clubId: ${clubId}`);
        return [];
    }

    return await response.json() as TrSession[];
}

// Fonction pour récupérer le planning complet
export async function fetchPlanning(date: string): Promise<DayPlanning> {
    console.log("fetchPlanning for DATE : ", date);
    const licenseeMap = await getLicencies();
    console.log("licenseeMap size : ", licenseeMap.size);
    const courts: CourtPlanning[] = [];

    for (const [courtNumber, clubId] of Object.entries(COURT_CLUB_IDS)) {
        console.log("clubId : ", clubId);
        console.log("courtNumber : ", courtNumber);

        const sessions = await fetchSessionsForCourt(clubId, date);
        console.log("sessions count : ", sessions.length);
        
        // Trier les sessions par heure
        const sortedSessions = sessions.sort((a, b) => {
            const timeA = parseInt(a.time.replace('H', ''));
            const timeB = parseInt(b.time.replace('H', ''));
            return timeA - timeB;
        });

        const slots: TimeSlot[] = sortedSessions.map(session => ({
            time: session.time,
            isAvailable: session.yesParticipants.length === 0,
            sessionId: session._id,
            participants: session.yesParticipants.map(userId => {
                const user = licenseeMap.get(userId) || { firstName: "Inconnu", lastName: "Inconnu" };
                return {
                    firstName: user.firstName,
                    lastName: user.lastName
                };
            })
        }));

        courts.push({
            courtNumber,
            slots
        });
    }

    return {
        date,
        courts
    };
}


export async function bookSession(userId: string, sessionId: string, friendUserId: string): Promise<TrBookingResponse> {
  try {
    const response = await fetch(BOOKING_URL, {
      method: 'POST',
      headers: {
        'Host': 'app.teamr.eu',
        'Content-Type': 'application/json',
        'User-Agent': 'HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0',
        'Accept': 'application/json, text/plain, */*',
        'Authorization': TEAMR_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        participant: {
          userId: userId,
          isPresent: 'yes',
          coordinates: [2.5864862369264747, 48.869659697477495], // Remplacez par les coordonnées réelles si nécessaire
          friendUserId: friendUserId,
        },
        sessionId: sessionId, 
        customId: CUSTOM_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const result: TrBookingResponse = await response.json();
    console.log('Réservation effectuée :', result);
    return result;
  } catch (error) {
    console.error('Erreur lors de la réservation :', error);
    throw error;
  }
} 