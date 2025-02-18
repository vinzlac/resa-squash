import { NextRequest, NextResponse } from 'next/server';
import { getFavorites, addFavorite, removeFavorite } from '@/app/lib/db';
import { getConnectedUser } from '@/app/services/connectedUser';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connectedUser = await getConnectedUser();
    if (!connectedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = connectedUser.userId

    console.log('GET /api/favorites - userId:', userId);

    const favorites = await getFavorites(userId);
    console.log('Favorites found:', favorites);
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Failed to fetch favorites - detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const connectedUser = await getConnectedUser();
    if (!connectedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = connectedUser.userId

    const body = await request.json();
    const { licenseeId, action } = body;

    if (!userId || !licenseeId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      await addFavorite(userId, licenseeId);
    } else if (action === 'remove') {
      await removeFavorite(userId, licenseeId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update favorites:', error);
    return NextResponse.json(
      { error: 'Failed to update favorites' },
      { status: 500 }
    );
  }
} 