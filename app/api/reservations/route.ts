import { NextResponse } from 'next/server';
import { getDailyReservations } from '@/app/services/common';
import { extractTeamrToken } from '@/app/utils/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const token = extractTeamrToken(request);

    if (!date || !token) {
      return NextResponse.json(
        { error: !date ? 'Date parameter is required' : 'Authentication required' },
        { status: 400 }
      );
    }

    console.log('GET /reservations - Fetching reservations for date:', date);
    const reservations = await getDailyReservations(date, token);
    
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les réservations' },
      { status: 500 }
    );
  }
} 