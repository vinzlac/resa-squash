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
    const { userIds, date, time, court } = body;

    // Validation des paramètres requis
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userIds requis (array non vide)'
        }
      }, { status: 400 });
    }

    if (!date || !time || !court) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'date, time et court requis'
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

    console.log('📥 POST /api/bookings - Paramètres:', { userIds, date, time, court });

    // TODO: Implémenter la logique de création de réservation
    // Pour le moment, on simule un succès
    console.log('✅ Réservation créée avec succès');

    return NextResponse.json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        userIds,
        date,
        time,
        court
      }
    }, { status: 201 });

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
