import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { BookingWithoutId } from '@/app/types/booking';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';

export async function GET(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    }, { status: 401 });
  }

  try {
    // Récupérer l'ID de l'utilisateur connecté
    const connectedUserId = extractConnectedUserId(request);
    if (!connectedUserId) {
      return NextResponse.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User ID not found'
        }
      }, { status: 401 });
    }

    // Récupérer toutes les futures réservations où l'utilisateur connecté a fait la réservation
    const now = new Date().toISOString();
    const rows = await executeQuery(`
      SELECT session_id, main_user_id, partner_id, start_date, club_id, booking_action_user_id
      FROM reservations
      WHERE booking_action_user_id = $1 AND start_date >= $2
      ORDER BY start_date ASC
    `, [connectedUserId, now]);

    // Transformer les résultats en BookingWithoutId
    const bookings: BookingWithoutId[] = rows.map(row => ({
      sessionId: row.session_id,
      userId: row.main_user_id, // Utiliser main_user_id au lieu de booking_action_user_id
      partnerId: row.partner_id,
      startDate: row.start_date,
      clubId: row.club_id,
      bookingActionUserId: row.booking_action_user_id // L'utilisateur qui a fait la réservation
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings without ID:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch bookings'
      }
    }, { status: 500 });
  }
}
