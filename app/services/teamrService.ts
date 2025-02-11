import { Reservation } from '@/app/types/reservation';
import { TEAMR_CONFIG } from '@/app/config/teamr';
import { fetchPlanning } from './common';

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
          id: parseInt(slot.sessionId),
          court: parseInt(court.courtNumber),
          time: slot.time,
          date: planning.date,
          available: slot.isAvailable,
          users: slot.isAvailable 
            ? [] 
            : slot.participants.map(participant => 
                `${participant.firstName} ${participant.lastName}`
              )
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