import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedUsers, addAuthorizedUser, removeAuthorizedUser } from '@/app/services/authorizationService';
import { ApiErrorResponse, ApiSuccessResponse } from '@/app/types/api';

export async function GET() {
  try {
    const authorizedUsers = await getAuthorizedUsers();
    return NextResponse.json(authorizedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs autorisés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs autorisés' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Paramètres invalides' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    if (action === 'add') {
      await addAuthorizedUser(email);
    } else {
      await removeAuthorizedUser(email);
    }

    return NextResponse.json({ success: true } as ApiSuccessResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des utilisateurs autorisés:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' } as ApiErrorResponse,
      { status: 500 }
    );
  }
} 