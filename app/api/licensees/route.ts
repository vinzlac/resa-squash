import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('API licenciés appelée');
    
    // Récupérer les licenciés de la base de données
    const licensees = await executeQuery(`
      SELECT userId, email, firstName, lastName
      FROM licensees
      ORDER BY lastName, firstName
    `);
    
    console.log(`${licensees.length} licenciés récupérés`);
    
    return NextResponse.json(licensees);
  } catch (error) {
    console.error('Erreur lors de la récupération des licenciés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 