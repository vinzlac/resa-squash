import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { getBookings } from '@/app/services/common';
import { ErrorCode, ApiError } from '@/app/types/errors';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = extractTeamrToken(request);
    if (!token) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const fromDate = searchParams.get('fromDate');

    // Utiliser le userId connecté par défaut si aucun userId n'est fourni
    const userId = userIdParam || extractConnectedUserId(request);

    // Validation des paramètres requis
    if (!userId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId requis (fourni ou connecté)'
        }
      }, { status: 400 });
    }

    // Validation du format de userId (doit être un ObjectId MongoDB)
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId doit être un ObjectId valide'
        }
      }, { status: 400 });
    }

    // Validation du format de fromDate si fourni (doit être une date ISO)
    if (fromDate && isNaN(Date.parse(fromDate))) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'fromDate doit être une date valide au format ISO'
        }
      }, { status: 400 });
    }

    console.log('📥 GET /api/bookings - Paramètres:', { userId, fromDate });

    // Appeler la fonction getBookings
    const bookings = await getBookings(userId, token, fromDate || undefined);

    // Ajouter le champ bookingActionUserId (même valeur que userId pour les bookings TeamR)
    const bookingsWithActionUserId = bookings.map(booking => ({
      ...booking,
      bookingActionUserId: booking.userId
    }));

    console.log('📤 GET /api/bookings - Réponse:', bookingsWithActionUserId.length, 'bookings');

    return NextResponse.json(bookingsWithActionUserId);

  } catch (error) {
    console.error('Erreur dans GET /api/bookings:', error);
    
    if ((error as ApiError).code) {
      return NextResponse.json({
        error: {
          code: (error as ApiError).code,
          message: (error as ApiError).message
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Erreur interne du serveur'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = extractTeamrToken(request);
    if (!token) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Récupérer le payload
    const body = await request.json();
    const { userIds, date, beginTime, endTime, court } = body;

    // Validation des paramètres requis
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userIds requis (array non vide)'
        }
      }, { status: 400 });
    }

    if (!date || !beginTime || !endTime || !court) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'date, beginTime, endTime et court requis'
        }
      }, { status: 400 });
    }

    // Validation du format de date
    if (isNaN(Date.parse(date))) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'date doit être une date valide'
        }
      }, { status: 400 });
    }

    console.log('📥 POST /api/bookings - Paramètres:', { userIds, date, beginTime, endTime, court });

    try {
      // 1. Récupérer les réservations pour la date donnée via le service interne
      const { getDailyReservations } = await import('@/app/services/common');
      const reservations = await getDailyReservations(date, token);
      
      console.log('📋 Toutes les réservations récupérées:', reservations.length);
      console.log('🔍 Recherche pour:', { beginTime, endTime, court });
      
      // Afficher quelques réservations pour debug
      reservations.slice(0, 3).forEach((res, index) => {
        console.log(`📅 Réservation ${index + 1}:`, {
          court: res.court,
          time: res.time,
          endTime: res.endTime,
          available: res.available
        });
      });
      
      // Filtrer par plage horaire - logique simplifiée
      const filteredReservations = reservations.filter((reservation: any) => {
        // Vérifier si le créneau correspond exactement à la plage demandée
        return reservation.time === beginTime && reservation.endTime === endTime;
      });
      
      console.log('📋 Réservations filtrées par horaire:', filteredReservations.length);
      
      // Afficher le détail des réservations trouvées pour ce créneau horaire
      if (filteredReservations.length > 0) {
        console.log('🎯 Réservations trouvées pour le créneau', beginTime, '-', endTime, ':');
        filteredReservations.forEach((reservation, index) => {
          console.log(`  ${index + 1}. Court ${reservation.court}: ${reservation.time}-${reservation.endTime} (disponible: ${reservation.available})`);
          if (!reservation.available && reservation.users && reservation.users.length > 0) {
            console.log(`     👥 Participants: ${reservation.users.map((u: any) => `${u.firstName} ${u.lastName}`).join(', ')}`);
          }
        });
      } else {
        console.log('❌ Aucune réservation trouvée pour le créneau', beginTime, '-', endTime);
        
        // Afficher tous les créneaux disponibles pour cette date
        console.log('📅 Tous les créneaux disponibles pour cette date:');
        const courtsMap = new Map();
        reservations.forEach(res => {
          if (!courtsMap.has(res.court)) {
            courtsMap.set(res.court, []);
          }
          courtsMap.get(res.court).push(res);
        });
        
        courtsMap.forEach((courtReservations, courtNumber) => {
          console.log(`  🏟️  Court ${courtNumber}:`);
          courtReservations.forEach((res: any) => {
            console.log(`     ${res.time}-${res.endTime} (disponible: ${res.available})`);
          });
        });
      }

      // 2. Trouver une session disponible pour le court spécifié
      let availableSession = filteredReservations.find((reservation: any) => 
        reservation.court === court && 
        reservation.available === true
      );

      // Si pas trouvé avec le filtrage exact, chercher dans toutes les réservations
      if (!availableSession) {
        console.log('🔍 Recherche dans toutes les réservations...');
        availableSession = reservations.find((reservation: any) => 
          reservation.court === court && 
          reservation.available === true &&
          reservation.time === beginTime &&
          reservation.endTime === endTime
        );
      }

      if (!availableSession) {
        console.log('❌ Aucune session trouvée. Réservations disponibles:');
        reservations.filter(r => r.court === court).forEach((res, index) => {
          console.log(`  ${index + 1}. Court ${res.court}, ${res.time}-${res.endTime}, disponible: ${res.available}`);
        });
        
        return NextResponse.json({
          error: {
            code: ErrorCode.INVALID_PARAMETER,
            message: `Aucune session disponible pour le terrain ${court} à ${beginTime}-${endTime} le ${date}`
          }
        }, { status: 400 });
      }

      console.log('🎯 Session trouvée:', availableSession.id);

      // 3. Créer la réservation via le service interne
      const { bookSession } = await import('@/app/services/common');
      const { createReservationIntoDB } = await import('@/app/lib/db');
      const { extractConnectedUserId } = await import('@/app/utils/auth');
      
      const bookingData = {
        userId: userIds[0],
        partnerId: userIds[1] || userIds[0], // Si un seul utilisateur, utiliser le même ID
        startDate: new Date(date).toISOString()
      };

      // Appel direct au service bookSession
      const bookingResult = await bookSession(availableSession.id, bookingData.userId, bookingData.partnerId, token);
      
      // Logger l'action de création de réservation
      const connectedUserId = extractConnectedUserId(request);
      if (connectedUserId) {
        await createReservationIntoDB(
          connectedUserId,
          availableSession.id,
          bookingData.userId,
          bookingData.partnerId,
          new Date(bookingData.startDate),
          bookingResult.session.clubId
        );
      }
      
      console.log('✅ Réservation créée avec succès:', bookingResult);

      return NextResponse.json({
        success: true,
        message: 'Réservation créée avec succès',
        data: {
          sessionId: availableSession.id,
          bookingId: availableSession.id, // Utiliser le sessionId comme bookingId
          userIds,
          date,
          beginTime,
          endTime,
          court
        }
      }, { status: 201 });

    } catch (apiError) {
      console.error('❌ Erreur lors de la création de réservation:', apiError);
      return NextResponse.json({
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: `Erreur lors de la création de la réservation: ${(apiError as Error).message}`
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur dans POST /api/bookings:', error);
    
    if ((error as ApiError).code) {
      return NextResponse.json({
        error: {
          code: (error as ApiError).code,
          message: (error as ApiError).message
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Erreur interne du serveur'
      }
    }, { status: 500 });
  }
}
