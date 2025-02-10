import { NextResponse } from 'next/server';
import { getFavorites, addFavorite, removeFavorite } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log('GET /api/favorites - userId:', userId);

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
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

export async function POST(request: Request) {
  try {
    const { userId, licenseeId, action } = await request.json();

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