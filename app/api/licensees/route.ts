import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Redirige toutes les requêtes vers la nouvelle route admin
export async function GET(request: NextRequest) {
  const newUrl = new URL('/api/admin/licensees', request.url);
  return NextResponse.redirect(newUrl);
}

export async function DELETE(request: NextRequest) {
  const newUrl = new URL('/api/admin/licensees', request.url);
  return NextResponse.redirect(newUrl);
} 