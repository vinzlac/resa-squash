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

export async function GET(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const fromTime = searchParams.get('fromTime');

    if (!date) {
      return Response.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Valider le format de fromTime si présent
    if (fromTime && !isValidTimeFormat(fromTime)) {
      return Response.json({ 
        error: 'Invalid fromTime format. Expected format: HHhMM (e.g., 12H00)' 
      }, { status: 400 });
    }

    console.log('GET /reservations - Fetching reservations for date:', date);
    let reservations = await getDailyReservations(date, token);

    // Filtrer les réservations si fromTime est spécifié
    if (fromTime) {
      reservations = reservations.filter(reservation => 
        compareTime(reservation.time, fromTime)
      );
    }

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les réservations' },
      { status: 500 }
    );
  }
} 