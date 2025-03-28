import { bookSession, deleteBookSession } from '@/app/services/common';
import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { ErrorCode, ApiError } from '@/app/types/errors';
import { createReservationIntoDB, removeReservationIntoDB } from '@/app/lib/db';

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
          code: ErrorCode.INVALID_REQUEST,
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
          code: ErrorCode.INVALID_REQUEST,
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
        new Date(startDate)
      );
    }
    
    return NextResponse.json(result);

  } catch (error) {
    if ((error as ApiError).code === ErrorCode.SLOT_ALREADY_BOOKED) {
      return NextResponse.json({
        error: {
          code: ErrorCode.SLOT_ALREADY_BOOKED,
          message: (error as ApiError).message
        }
      }, { status: 403 });
    }
    
    console.error('Erreur lors de la réservation:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Une erreur est survenue lors de la réservation'
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId est requis' }, { status: 400 });
    }

    const body = await request.json() as BookingRequest;
    const { userId, partnerId, startDate } = body;

    if (!userId || !partnerId || !startDate) {
      return NextResponse.json(
        { error: 'userId, partnerId et startDate sont requis' },
        { status: 400 }
      );
    }

    await deleteBookSession(sessionId, userId, partnerId, token);
    
    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    // Logger l'action de suppression de réservation avec l'utilisateur connecté
    if (connectedUserId) {
      await removeReservationIntoDB(sessionId);
    }

    return NextResponse.json({
      sessionId,
      userId,
      partnerId
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId est requis' }, { status: 400 });
    }

    const body = await request.json() as BookingRequest;
    const { userId, partnerId, startDate } = body;

    if (!userId || !partnerId || !startDate) {
      return NextResponse.json(
        { error: 'userId, partnerId et startDate sont requis' },
        { status: 400 }
      );
    }

    await bookSession(sessionId, userId, partnerId, token);
    
    // Récupérer l'ID de l'utilisateur connecté depuis le token
    const connectedUserId = extractConnectedUserId(request);
    
    // Logger l'action de création de réservation avec l'utilisateur connecté
    if (connectedUserId) {
      await createReservationIntoDB(
        connectedUserId,
        sessionId,
        userId,
        partnerId,
        new Date(startDate)
      );
    }

    return NextResponse.json({
      sessionId,
      userId,
      partnerId
    });

  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réservation' },
      { status: 500 }
    );
  }
}