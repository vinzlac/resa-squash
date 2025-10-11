import { bookSession, deleteBookSession } from '@/app/services/common';
import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { ErrorCode, ApiError } from '@/app/types/errors';
import { createReservationIntoDB, removeReservationIntoDB } from '@/app/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';

interface BookingRequest {
  userId: string;
  partnerId: string;
  startDate: string; // Format ISO string
}

export async function PUT(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required'
      }
    }, { status: 401 });
  }

  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'sessionId est requis'
        }
      }, { status: 400 });
    }

    // Extraction du body JSON
    const body = await request.json() as BookingRequest;
    const { userId, partnerId, startDate } = body;

    // Validation des données
    if (!userId || !partnerId || !startDate) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId, partnerId et startDate sont requis'
        }
      }, { status: 400 });
    }

    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    let result;
    try {
      // Appel à la fonction bookSession
      result = await bookSession(sessionId, userId, partnerId, token);
      
      // Logger l'action de création de réservation avec l'utilisateur connecté
      if (connectedUserId) {
        await createReservationIntoDB(
          connectedUserId,
          sessionId,
          userId,
          partnerId,
          new Date(startDate),
          result.session.clubId
        );
        
        // Logger l'action ADD_BOOKING
        const { logAddBooking } = await import('@/app/lib/db');
        const { getDailyReservations } = await import('@/app/services/common');
        
        // Récupérer le numéro de court
        const reservations = await getDailyReservations(
          new Date(startDate).toISOString().split('T')[0],
          token
        );
        const sessionInfo = reservations.find(r => r.id === sessionId);
        
        if (sessionInfo) {
          await logAddBooking(
            connectedUserId,
            sessionInfo.court,
            new Date(startDate).toISOString().split('T')[0],
            sessionInfo.time,
            [userId, partnerId],
            true
          );
        }
      }
      
      return NextResponse.json(result);
    } catch (bookingError) {
      // Logger l'échec de la réservation
      if (connectedUserId) {
        const { logAddBooking } = await import('@/app/lib/db');
        await logAddBooking(connectedUserId, 0, '', '', [userId, partnerId], false);
      }
      throw bookingError;
    }

  } catch (error) {
    if ((error as ApiError).code === ErrorCode.INVALID_PARAMETER) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: (error as ApiError).message
        }
      }, { status: 403 });
    }
    
    console.error('Erreur lors de la réservation:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Une erreur est survenue lors de la réservation'
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required'
      }
    }, { status: 401 });
  }

  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'sessionId est requis'
        }
      }, { status: 400 });
    }

    // Extraction du body JSON
    const body = await request.json() as BookingRequest;
    const { userId, partnerId, startDate } = body;

    // Validation des données
    if (!userId || !partnerId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId et partnerId sont requis'
        }
      }, { status: 400 });
    }

    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    // Vérifier si la réservation existe en base
    const { executeQuery } = await import('@/app/lib/db');
    const existingReservations = await executeQuery(
      'SELECT * FROM reservations WHERE session_id = $1',
      [sessionId]
    );
    
    const reservationExistsInDB = existingReservations.length > 0;
    console.log(`🔍 Réservation ${sessionId} existe en base:`, reservationExistsInDB);
    
    // Récupérer les informations de la session pour le logging
    const { getDailyReservations } = await import('@/app/services/common');
    const reservations = await getDailyReservations(
      new Date(startDate).toISOString().split('T')[0],
      token
    );
    const sessionInfo = reservations.find(r => r.id === sessionId);
    
    let deleteSuccess = false;
    try {
      // Appel à la fonction deleteBookSession (si ça échoue, on renvoie l'erreur)
      await deleteBookSession(sessionId, userId, partnerId, token);
      console.log('✅ Suppression TeamR réussie');
      deleteSuccess = true;
      
      // Faire la suppression logique SEULEMENT si TeamR a réussi
      if (connectedUserId) {
        if (reservationExistsInDB) {
          // Mettre à jour l'enregistrement existant
          await removeReservationIntoDB(sessionId);
          console.log('✅ Suppression logique effectuée (UPDATE)');
        } else {
          // Créer une nouvelle entrée avec deleted=true
          const { COURT_CLUB_IDS } = await import('@/app/services/config');
          
          // Obtenir le clubId à partir du numéro de court
          const clubId = sessionInfo ? COURT_CLUB_IDS[sessionInfo.court.toString()] : '';
          
          console.log('📋 Session info pour insertion:', {
            sessionId,
            court: sessionInfo?.court,
            clubId
          });
          
          // Créer l'entrée avec deleted=true directement
          await executeQuery(
            'INSERT INTO reservations (booking_action_user_id, session_id, user_id, partner_id, start_date, club_id, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [connectedUserId, sessionId, userId, partnerId, new Date(startDate).toISOString(), clubId, true]
          );
          console.log('✅ Suppression logique effectuée (INSERT avec deleted=true)');
        }
        
        // Logger l'action DELETE_BOOKING
        const { logDeleteBooking } = await import('@/app/lib/db');
        if (sessionInfo) {
          await logDeleteBooking(
            connectedUserId,
            sessionInfo.court,
            new Date(startDate).toISOString().split('T')[0],
            sessionInfo.time,
            [userId, partnerId],
            true
          );
        }
      }
      
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      // Logger l'échec de la suppression
      if (connectedUserId && sessionInfo) {
        const { logDeleteBooking } = await import('@/app/lib/db');
        await logDeleteBooking(
          connectedUserId,
          sessionInfo.court,
          new Date(startDate).toISOString().split('T')[0],
          sessionInfo.time,
          [userId, partnerId],
          false
        );
      }
      throw deleteError;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Une erreur est survenue lors de la suppression de la réservation'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required'
      }
    }, { status: 401 });
  }

  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'sessionId est requis'
        }
      }, { status: 400 });
    }

    // Extraction du body JSON
    const body = await request.json() as BookingRequest;
    const { userId, partnerId, startDate } = body;

    // Validation des données
    if (!userId || !partnerId || !startDate) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId, partnerId et startDate sont requis'
        }
      }, { status: 400 });
    }

    // Appel à la fonction bookSession
    const result = await bookSession(sessionId, userId, partnerId, token);
    
    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    // Logger l'action de création de réservation avec l'utilisateur connecté
    if (connectedUserId) {
      await createReservationIntoDB(
        connectedUserId,
        sessionId,
        userId,
        partnerId,
        new Date(startDate),
        result.session.clubId
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    if ((error as ApiError).code === ErrorCode.INVALID_PARAMETER) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: (error as ApiError).message
        }
      }, { status: 403 });
    }
    
    console.error('Erreur lors de la réservation:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Une erreur est survenue lors de la réservation'
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Non autorisé'
        }
      }, { status: 401 });
    }

    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'sessionId est requis'
        }
      }, { status: 400 });
    }

    // TODO: Implémenter la logique de récupération des réservations
    return NextResponse.json({ reservations: [] });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Erreur serveur'
      }
    }, { status: 500 });
  }
}