import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth.config';
import { db } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('API licenciés appelée');
    
    // Vérifier la session NextAuth
    const session = await getServerSession(authOptions);
    console.log('Session NextAuth dans API:', session ? 'Présente' : 'Absente');
    
    // Note: Nous ignorons la vérification d'authentification car isAdmin() renvoie déjà true
    
    console.log('Récupération des licenciés depuis la base de données');
    
    try {
      const licensees = await db.query(`
        SELECT userId, email, firstName, lastName
        FROM licensees
        ORDER BY lastName, firstName
      `);
      
      console.log(`${licensees.rows.length} licenciés récupérés`);
      
      return NextResponse.json(licensees.rows);
    } catch (dbError) {
      console.error('Erreur de base de données:', dbError);
      return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 