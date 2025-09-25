import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { MergeBooking, BookingWithoutId } from '@/app/types/booking';
import { getBookings } from '@/app/services/common';

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

    // Récupérer les bookings depuis TeamR (API externe)
    const teamrBookings = await getBookings(
      connectedUserId,
      token,
      new Date().toISOString()
    );

    // Récupérer les bookings depuis la base de données locale
    const response = await fetch(`${request.nextUrl.origin}/api/bookingWithoutId`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    let localBookings: BookingWithoutId[] = [];
    if (response.ok) {
      localBookings = await response.json();
    }

    // Fusionner les deux listes en utilisant sessionId comme clé
    const mergeBookings: MergeBooking[] = [];

    // Créer un Map pour les bookings locaux indexés par sessionId
    const localBookingsMap = new Map();
    localBookings.forEach(booking => {
      localBookingsMap.set(booking.sessionId, booking);
    });

    // Traiter les bookings TeamR
    teamrBookings.forEach(teamrBooking => {
      const localBooking = localBookingsMap.get(teamrBooking.sessionId);
      
      if (localBooking) {
        // Booking trouvé dans les deux sources - fusionner
        mergeBookings.push({
          bookingId: teamrBooking.bookingId,
          sessionId: teamrBooking.sessionId,
          userId: teamrBooking.userId,
          partnerId: teamrBooking.partnerId,
          startDate: teamrBooking.startDate,
          clubId: teamrBooking.clubId,
          bookingActionUserId: teamrBooking.userId, // Dans Booking, c'est le même que userId
          createdAt: localBooking.createdAt
        });
        
        // Marquer comme traité
        localBookingsMap.delete(teamrBooking.sessionId);
      } else {
        // Booking TeamR sans correspondance locale
        mergeBookings.push({
          bookingId: teamrBooking.bookingId,
          sessionId: teamrBooking.sessionId,
          userId: teamrBooking.userId,
          partnerId: teamrBooking.partnerId,
          startDate: teamrBooking.startDate,
          clubId: teamrBooking.clubId,
          bookingActionUserId: teamrBooking.userId
          // createdAt sera undefined
        });
      }
    });

    // Traiter les bookings locaux restants (sans correspondance TeamR)
    localBookingsMap.forEach(localBooking => {
      mergeBookings.push({
        // bookingId sera undefined
        sessionId: localBooking.sessionId,
        userId: localBooking.userId,
        partnerId: localBooking.partnerId,
        startDate: localBooking.startDate,
        clubId: localBooking.clubId,
        bookingActionUserId: localBooking.bookingActionUserId,
        createdAt: localBooking.createdAt
      });
    });

    // Trier par date de début
    mergeBookings.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json(mergeBookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch all bookings'
      }
    }, { status: 500 });
  }
}
