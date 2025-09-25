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
    const { userId, partnerId } = body;

    // Validation des données
    if (!userId || !partnerId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_PARAMETER,
          message: 'userId et partnerId sont requis'
        }
      }, { status: 400 });
    }

    // Appel à la fonction deleteBookSession
    await deleteBookSession(sessionId, userId, partnerId, token);
    
    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    // Logger l'action de suppression de réservation avec l'utilisateur connecté
    if (connectedUserId) {
      await removeReservationIntoDB(sessionId);
    }
    
    return NextResponse.json({ success: true });
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