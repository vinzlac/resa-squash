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

    console.log('📤 GET /api/bookings - Réponse:', bookings.length, 'bookings');

    return NextResponse.json(bookings);

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
