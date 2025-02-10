import { NextResponse } from 'next/server';
import { getFavorites } from '@/app/lib/db';

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