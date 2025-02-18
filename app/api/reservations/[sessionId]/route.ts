import { bookSession, deleteBookSession } from '@/app/services/common';
import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken } from '@/app/utils/auth';

interface BookingRequest {
  userId: string;
  partnerId: string;
}

export async function PUT(request: NextRequest) {
  const token = extractTeamrToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId est requis' }, { status: 400 });
    }

    // Extraction du body JSON
    const body = await request.json() as BookingRequest;
    const { userId, partnerId } = body;

    // Validation des données
    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'userId et partnerId sont requis' },
        { status: 400 }
      );
    }

    // Appel à la fonction bookSession
    await bookSession(sessionId, userId, partnerId, token);

    // Retour du résultat
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