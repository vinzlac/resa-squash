import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET() {
  try {
    const result = await db.query(
      'SELECT user_id FROM authorized_users'
    );
    
    return NextResponse.json(result.rows.map(row => row.user_id));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs autorisés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (action === 'add') {
      await db.query(
        'INSERT INTO authorized_users (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
        [userId]
      );
    } else if (action === 'remove') {
      await db.query(
        'DELETE FROM authorized_users WHERE user_id = $1',
        [userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des utilisateurs autorisés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 