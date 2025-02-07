import { NextResponse } from 'next/server';
import { teamrService } from '@/app/services/teamrService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const reservations = await teamrService.getDailyReservations(date);
    
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les réservations' },
      { status: 500 }
    );
  }
} 