import { NextRequest, NextResponse } from 'next/server';
import { getUserRights, addUserRight, removeUserRight, getAllUserRights, getAuthorizedUsersWithNames } from '@/app/services/rightsService';
import { UserRight } from '@/app/types/rights';
import { ApiErrorResponse, ApiSuccessResponse } from '@/app/types/api';
import { ensureLicenseesMapByEmailIsInitialized, setGlobalTeamrToken } from '@/app/services/common';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const teamr_token = request.cookies.get('teamr_token')?.value;
    console.log("teamr_token : ", teamr_token);
    
    // Stocker le token global si disponible
    if (teamr_token) {
      setGlobalTeamrToken(teamr_token);
    }
    
    // Initialiser la map si nécessaire
    await ensureLicenseesMapByEmailIsInitialized();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      // Get rights for a specific user
      const rights = await getUserRights(userId);
      return NextResponse.json({ rights });
    } else {
      // Get all users with their rights
      const users = await getAuthorizedUsersWithNames();
      const allRights = await getAllUserRights();
      
      return NextResponse.json({ 
        users,
        userRights: allRights
      });
    }
  } catch (error) {
    console.error('Error fetching user rights:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des droits utilisateur' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, right, action } = await request.json();

    if (!userId || !right || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Paramètres invalides' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    // Validate that right is a valid UserRight
    if (!Object.values(UserRight).includes(right as UserRight)) {
      return NextResponse.json(
        { error: 'Droit utilisateur invalide' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    if (action === 'add') {
      await addUserRight(userId, right as UserRight);
    } else {
      await removeUserRight(userId, right as UserRight);
    }

    return NextResponse.json({ success: true } as ApiSuccessResponse);
  } catch (error) {
    console.error('Error updating user rights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' } as ApiErrorResponse,
      { status: 500 }
    );
  }
} 