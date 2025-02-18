import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/app/types/auth';

// Liste des requêtes autorisées avec leurs paramètres attendus
const ALLOWED_QUERIES = {
  'check_auth': 'SELECT email FROM authorized_users WHERE email = $1',
  // Ajouter d'autres requêtes autorisées ici
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est authentifié
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.email) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { queryType, params }: { queryType: keyof typeof ALLOWED_QUERIES, params: string[] } = await request.json();
    
    // Vérifier que la requête est autorisée
    if (!queryType || !ALLOWED_QUERIES[queryType]) {
      return NextResponse.json(
        { error: 'Requête non autorisée' },
        { status: 403 }
      );
    }

    // Exécuter la requête autorisée
    const result = await executeQuery(ALLOWED_QUERIES[queryType], params || []);
    return NextResponse.json({ rows: result });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
} 