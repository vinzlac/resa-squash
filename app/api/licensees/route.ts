import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { licenseesMapByUserId, ensureLicenseesMapByUserIdIsInitialized } from '@/app/services/common';
import { ApiError, ErrorCode } from '@/app/types/errors';

export async function GET(request: Request) {
  console.log("GET licensees");
  try {
    // Vérifier l'authentification
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { error: 'Non autorisé' },
    //     { status: ErrorCode.UNAUTHORIZED }
    //   );
    // }

    // Récupérer le userId depuis les searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw {
        code: ErrorCode.INVALID_PARAMETER,
        message: 'Le userId est requis'
      } as ApiError;
    }

    // S'assurer que la map des licenciés est initialisée
    await ensureLicenseesMapByUserIdIsInitialized();

    // Récupérer les informations du licencié depuis la map statique
    const licensee = licenseesMapByUserId.get(userId);
    
    if (!licensee) {
      throw {
        code: ErrorCode.NOT_FOUND,
        message: `Aucun licencié trouvé avec l'ID ${userId}`
      } as ApiError;
    }

    return NextResponse.json(licensee);
  } catch (error) {
    console.error('Erreur lors de la récupération du licencié:', error);
    
    if ((error as ApiError).code) {
      const apiError = error as ApiError;
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.code }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: ErrorCode.INTERNAL_SERVER_ERROR }
    );
  }
} 