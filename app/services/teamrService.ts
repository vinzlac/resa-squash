import { Reservation } from '@/app/types/reservation';
import { TEAMR_CONFIG } from '@/app/config/teamr';
import { fetchPlanning } from './common';

interface TeamrReservation {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  userId: string;
  userName: string;
  status: string;
}

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

  private mapTeamrReservationToReservation(teamrReservation: TeamrReservation): Reservation {
    return {
      id: parseInt(teamrReservation.id),
      court: parseInt(teamrReservation.courtId),
      time: this.formatTime(teamrReservation.startTime),
      user: teamrReservation.userName,
      date: this.formatDate(teamrReservation.startTime),
      available: teamrReservation.status === 'available'
    };
  }

  async getDailyReservations(date: string): Promise<Reservation[]> {
    try {
      const planning = await fetchPlanning(date);
      
      const reservations: Reservation[] = [];

      planning.courts.forEach(court => {
        court.slots.forEach(slot => {
          if (slot.isAvailable) {
            // Crée une réservation pour un slot disponible
            reservations.push({
              id: parseInt(slot.sessionId),
              court: parseInt(court.courtNumber),
              time: slot.time,
              date: planning.date,
              available: true
            });
          } else {
            // Crée une réservation pour chaque participant
            slot.participants.forEach(participant => {
              reservations.push({
                id: parseInt(slot.sessionId),
                court: parseInt(court.courtNumber),
                time: slot.time,
                user: `${participant.firstName} ${participant.lastName}`,
                date: planning.date,
                available: false
              });
            });
          }
        });
      });

      return reservations;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw new Error('Impossible de récupérer les réservations');
    }
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