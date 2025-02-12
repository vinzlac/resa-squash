
import { bookSession, deleteBookSession } from '@/app/services/common';
import { NextRequest, NextResponse } from 'next/server';

interface BookingRequest {
  userId: string;
  partnerId: string;
}

export async function PUT(request: NextRequest) {
  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1]; // Récupérer le dernier segment

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

    // Appel à la fonction bookSession (assure-toi qu'elle est bien importée)
    await bookSession(sessionId, userId, partnerId);

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
  try {
    // Récupération de sessionId depuis l'URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const sessionId = pathSegments[pathSegments.length - 1]; // Récupérer le dernier segment

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

    console.log("delete booking session : ", sessionId, userId, partnerId);
    await deleteBookSession(sessionId, userId, partnerId);

    // Retour du résultat
    return NextResponse.json({
      sessionId,
      userId,
      partnerId
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la réservation' },
      { status: 500 }
    );
  }
}