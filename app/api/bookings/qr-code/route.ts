import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { ErrorCode } from '@/app/types/errors';
import { getBookings } from '@/app/services/common';

export async function GET(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  // Utiliser le userId connecté par défaut si aucun userId n'est fourni
  const targetUserId = userId || extractConnectedUserId(request);

  if (!targetUserId) {
    return NextResponse.json(
      { error: { code: ErrorCode.INVALID_PARAMETER, message: 'userId requis (fourni ou connecté)' } },
      { status: 400 }
    );
  }

  if (!bookingId && !sessionId) {
    return NextResponse.json(
      { error: { code: ErrorCode.INVALID_PARAMETER, message: 'bookingId ou sessionId doit être fourni en paramètre de requête' } },
      { status: 400 }
    );
  }


  try {
    let finalBookingId: string;

    // Construire l'URL en fonction des paramètres disponibles
    // bookingId est prioritaire sur sessionId
    if (bookingId) {
      finalBookingId = bookingId;
      console.log(`📤 Utilisation du bookingId direct: ${bookingId} (userId: ${targetUserId})`);
    } else if (sessionId) {
      // Récupérer les bookings de l'utilisateur pour trouver le bookingId correspondant au sessionId
      console.log(`📤 Recherche du bookingId pour sessionId: ${sessionId} (userId: ${targetUserId})`);
      
      const bookings = await getBookings(targetUserId, token);
      const matchingBooking = bookings.find(booking => booking.sessionId === sessionId);
      
      if (!matchingBooking) {
        return NextResponse.json(
          { error: { code: ErrorCode.NOT_FOUND, message: `Aucune réservation trouvée pour sessionId: ${sessionId}` } },
          { status: 404 }
        );
      }
      
      finalBookingId = matchingBooking.bookingId;
      console.log(`📥 Booking trouvé: ${finalBookingId} pour sessionId: ${sessionId}`);
    } else {
      throw new Error('Aucun identifiant valide fourni');
    }

    // Récupérer le QR code avec le bookingId final
    const qrCodeUrl = `https://app.teamr.eu/bookings/qrCode/${finalBookingId}`;
    console.log(`📤 Récupération du QR code pour bookingId: ${finalBookingId}`);

    const response = await fetch(qrCodeUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status} lors de la récupération du QR code`);
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const qrCodeData = await response.json();
    console.log('📥 QR code récupéré avec succès');
    
    return NextResponse.json(qrCodeData);
  } catch (error) {
    console.error('Erreur lors de la récupération du QR code:', error);
    return NextResponse.json(
      { error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: 'Erreur serveur' } },
      { status: 500 }
    );
  }
}
