import { bookSession, deleteBookSession } from '@/app/services/common';
import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken } from '@/app/utils/auth';
import { ErrorCode, ApiError } from '@/app/types/errors';

interface BookingRequest {
  userId: string;
  partnerId: string;
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
    const { userId, partnerId } = body;

    // Validation des données
    if (!userId || !partnerId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'userId et partnerId sont requis'
        }
      }, { status: 400 });
    }

    // Appel à la fonction bookSession
    const result = await bookSession(sessionId, userId, partnerId, token);
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

    const body = await request.json();
    const { userId, partnerId } = body;

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId et partnerId sont requis' },
        { status: 400 }
      );
    }

    await deleteBookSession(sessionId, userId, partnerId, token);

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
    const { userId, partnerId } = body;

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId et partnerId sont requis' },
        { status: 400 }
      );
    }

    await bookSession(sessionId, userId, partnerId, token);

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