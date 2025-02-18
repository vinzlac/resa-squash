import { Reservation } from '@/app/types/reservation';
import { TEAMR_CONFIG } from '@/app/config/teamr';
import { fetchPlanning } from './common';
import { TeamRAuthRequest, TeamRAuthResponse } from '@/app/types/teamr';

class TeamrService {
  private baseUrl: string;
  private apiKey: string;
  private facilityId: string;

  constructor() {
    this.baseUrl = TEAMR_CONFIG.BASE_URL;
    this.apiKey = TEAMR_CONFIG.API_KEY;
    this.facilityId = TEAMR_CONFIG.FACILITY_ID;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public async getDailyReservations(date: string): Promise<Reservation[]> {
    console.log("getDailyReservations for DATE : ", date);
    const reservations: Reservation[] = [];
    const planning = await fetchPlanning(date);

    console.log("PLANNING : ", planning);
    planning.courts.forEach(court => {
      court.slots.forEach(slot => {
        reservations.push({
          id: slot.sessionId,
          court: parseInt(court.courtNumber),
          time: slot.time,
          date: planning.date,
          available: slot.isAvailable,
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

  async getCourts(): Promise<{ id: string; name: string; }[]> {
    try {
      const url = `${this.baseUrl}/facilities/${this.facilityId}/courts`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Teamr: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des terrains:', error);
      throw new Error('Impossible de récupérer la liste des terrains');
    }
  }
}

// Export d'une instance unique du service
export const teamrService = new TeamrService();

const TEAMR_AUTH_URL = 'https://app.teamr.eu/users/custom/authenticate/v2';
const CUSTOM_ID = '5dd6b3961510c91d353b0833';

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
    headers: {
      'Host': 'app.teamr.eu',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'HappyPeople/201 CFNetwork/1568.200.51 Darwin/24.1.0',
    },
    body: JSON.stringify(authRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur d\'authentification TeamR');
  }

  return response.json();
} 