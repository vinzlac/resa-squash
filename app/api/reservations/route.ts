import { NextResponse } from 'next/server';
import { getDailyReservations } from '@/app/services/common';
import { extractTeamrToken } from '@/app/utils/auth';
import { NextRequest } from 'next/server';

function isValidTimeFormat(time: string): boolean {
  return /^\d{2}H\d{2}$/.test(time);
}

function compareTime(time1: string, time2: string): boolean {
  // Convertit les heures au format "HH:MM" en minutes pour faciliter la comparaison
  const [hours1, minutes1] = time1.replace('H', ':').split(':').map(Number);
  const [hours2, minutes2] = time2.replace('H', ':').split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  return totalMinutes1 >= totalMinutes2;
}

function isTimeInRange(time: string, endTime: string, fromTime: string | null, toTime: string | null): boolean {
  // Si aucun filtre n'est appliqué, on accepte le créneau
  if (!fromTime && !toTime) return true;
  
  // Vérifier la borne inférieure
  if (fromTime && !compareTime(time, fromTime)) return false;
  
  // Vérifier la borne supérieure
  if (toTime && compareTime(endTime, toTime)) return false;
  
  return true;
}

export async function GET(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const fromTime = searchParams.get('fromTime');
    const toTime = searchParams.get('toTime');

    if (!date) {
      return Response.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Valider le format des paramètres de temps
    if (fromTime && !isValidTimeFormat(fromTime)) {
      return Response.json({ 
        error: 'Invalid fromTime format. Expected format: HHhMM (e.g., 12H00)' 
      }, { status: 400 });
    }

    if (toTime && !isValidTimeFormat(toTime)) {
      return Response.json({ 
        error: 'Invalid toTime format. Expected format: HHhMM (e.g., 12H00)' 
      }, { status: 400 });
    }

    // Vérifier que toTime est après fromTime si les deux sont spécifiés
    if (fromTime && toTime && !compareTime(toTime, fromTime)) {
      return Response.json({ 
        error: 'toTime must be after fromTime' 
      }, { status: 400 });
    }

    console.log('GET /reservations - Fetching reservations for date:', date);
    let reservations = await getDailyReservations(date, token);

    // Filtrer les réservations selon la plage horaire
    reservations = reservations.filter(reservation => 
      isTimeInRange(reservation.time, reservation.endTime, fromTime, toTime)
    );

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les réservations' },
      { status: 500 }
    );
  }
} 