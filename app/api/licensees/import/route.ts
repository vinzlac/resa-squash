import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Redirige toutes les requêtes vers la nouvelle route admin
export async function POST(request: NextRequest) {
  const newUrl = new URL('/api/admin/licensees/import', request.url);
  return NextResponse.redirect(newUrl);
} 