import { Reservation, User } from '@/app/types/reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Génère un texte formaté pour partager une réservation
 */
export function generateReservationShareText(
  reservation: Reservation,
  users: User[],
  courtNumber: number,
  date: string
): string {
  const formattedDate = format(new Date(date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
  const userNames = users.map(u => `${u.firstName} ${u.lastName}`).join(' et ');
  
  return `🏸 Réservation de squash

Court ${courtNumber}
📅 ${formattedDate}
👥 ${userNames}

Partagé depuis l'app Résa Squash`;
}

/**
 * Génère un texte formaté pour partager plusieurs réservations (recopie)
 */
export function generateMultipleReservationsShareText(
  reservations: Array<{
    date: string;
    beginTime: string;
    endTime: string;
    court: number;
    users: Array<{ firstName: string; lastName: string }>;
  }>,
  targetDate: string
): string {
  const formattedTargetDate = format(new Date(targetDate), "EEEE d MMMM yyyy", { locale: fr });
  
  let text = `🏸 Réservations de squash\n\n📅 Nouvelle date: ${formattedTargetDate}\n\n`;
  
  reservations.forEach((res, index) => {
    const originalDate = format(new Date(res.date), "dd/MM/yyyy", { locale: fr });
    const userNames = res.users.map(u => `${u.firstName} ${u.lastName}`).join(' et ');
    text += `${index + 1}. Court ${res.court} - ${res.beginTime}-${res.endTime}\n   👥 ${userNames}\n   📅 (Original: ${originalDate})\n\n`;
  });
  
  text += 'Partagé depuis l\'app Résa Squash';
  return text;
}

/**
 * Génère une URL de partage (optionnel, si vous voulez créer des liens vers votre app)
 */
export function generateReservationShareUrl(): string {
  // Si vous avez une page de détails de réservation accessible publiquement
  // return `${window.location.origin}/reservation/${sessionId}`;
  
  // Sinon, retourner l'URL de l'app
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * Génère un texte formaté pour partager une liste de créneaux sélectionnés
 * SANS les noms des participants (pour l'affichage dans la page de réservations)
 * Fusionne les créneaux consécutifs sur le même court
 */
export function generateSelectedSlotsShareText(
  bookings: Array<{
    date: string;
    beginTime: string;
    endTime: string;
    court: number;
  }>
): string {
  // Grouper les créneaux par court
  const bookingsByCourt: { [court: number]: Array<{ beginTime: string; endTime: string }> } = {};
  
  bookings.forEach(booking => {
    if (!bookingsByCourt[booking.court]) {
      bookingsByCourt[booking.court] = [];
    }
    bookingsByCourt[booking.court].push({
      beginTime: booking.beginTime,
      endTime: booking.endTime,
    });
  });

  // Fusionner les créneaux consécutifs pour chaque court
  const mergedBookings: Array<{ court: number; beginTime: string; endTime: string }> = [];

  Object.keys(bookingsByCourt).forEach(courtStr => {
    const court = parseInt(courtStr);
    const courtBookings = bookingsByCourt[court];
    
    // Trier par heure de début
    courtBookings.sort((a, b) => {
      const timeA = a.beginTime.replace('H', ':');
      const timeB = b.beginTime.replace('H', ':');
      return timeA.localeCompare(timeB);
    });

    // Fusionner les créneaux consécutifs
    let currentSlot = { beginTime: courtBookings[0].beginTime, endTime: courtBookings[0].endTime };

    for (let i = 1; i < courtBookings.length; i++) {
      const nextSlot = courtBookings[i];
      
      // Vérifier si le créneau suivant est consécutif (l'heure de fin = l'heure de début du suivant)
      if (currentSlot.endTime === nextSlot.beginTime) {
        // Fusionner : garder le début du premier et la fin du dernier
        currentSlot.endTime = nextSlot.endTime;
      } else {
        // Le créneau n'est pas consécutif, ajouter le créneau actuel et commencer un nouveau
        mergedBookings.push({
          court,
          beginTime: currentSlot.beginTime,
          endTime: currentSlot.endTime,
        });
        currentSlot = { beginTime: nextSlot.beginTime, endTime: nextSlot.endTime };
      }
    }
    
    // Ajouter le dernier créneau (fusionné ou non)
    mergedBookings.push({
      court,
      beginTime: currentSlot.beginTime,
      endTime: currentSlot.endTime,
    });
  });

  // Trier les créneaux fusionnés par court puis par heure
  mergedBookings.sort((a, b) => {
    if (a.court !== b.court) {
      return a.court - b.court;
    }
    const timeA = a.beginTime.replace('H', ':');
    const timeB = b.beginTime.replace('H', ':');
    return timeA.localeCompare(timeB);
  });

  // Générer le texte final
  const lines = mergedBookings.map(booking => {
    return `Court ${booking.court} : ${booking.beginTime}-${booking.endTime}`;
  });

  return lines.join('\n');
}

