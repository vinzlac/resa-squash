import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/auth.config';
import { executeQuery } from '@/app/lib/db';
import { fetchAllLicenseesByEmail } from '@/app/services/common';
import { getGlobalTeamrToken } from '@/app/services/common';
import { extractTeamrToken } from '@/app/utils/auth';
import { NextRequest } from 'next/server';

interface Licensee {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  rejected: Licensee[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('API import licenciés appelée');
    
    // Récupérer le token depuis différentes sources
    const cookieToken = extractTeamrToken(request);
    const session = await getServerSession(authOptions);
    const globalToken = getGlobalTeamrToken();
    
    // Utiliser le premier token disponible
    const token = cookieToken || session?.accessToken || globalToken;
    
    // Si aucun token disponible, créer un jeu de test fictif pour le développement
    if (!token) {
      console.warn('Aucun token disponible - Mode développement activé');
      
      // Récupérer tous les licenciés actuels de la base de données
      const existingLicensees = await executeQuery('SELECT userId, email, firstName, lastName FROM licensees');
      
      return NextResponse.json({
        imported: 0,
        skipped: existingLicensees.length,
        rejected: []
      });
    }
    
    // Récupérer tous les licenciés de TeamR
    const teamrLicensees = await fetchAllLicenseesByEmail(token);
    console.log(`${teamrLicensees.size} licenciés récupérés depuis TeamR`);
    
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      rejected: []
    };
    
    // Récupérer tous les licenciés actuels de la base de données
    const existingLicensees = await executeQuery('SELECT userId, email, firstName, lastName FROM licensees');
    const existingLicenseesMap = new Map<string, Licensee>();
    
    // Convertir les résultats en Map pour faciliter la recherche
    existingLicensees.forEach((licensee: Licensee) => {
      existingLicenseesMap.set(licensee.userId, licensee);
    });
    
    // Traiter chaque licencié TeamR
    for (const licenseeTR of Array.from(teamrLicensees.values())) {
      if (!licenseeTR.user || !licenseeTR.user[0]) continue;
      
      const user = licenseeTR.user[0];
      
      const licensee: Licensee = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      // Vérifier si le licencié existe déjà
      if (existingLicenseesMap.has(licensee.userId)) {
        const existingLicensee = existingLicenseesMap.get(licensee.userId)!;
        
        // Vérifier s'il y a un conflit
        if (
          existingLicensee.email !== licensee.email ||
          existingLicensee.firstName !== licensee.firstName ||
          existingLicensee.lastName !== licensee.lastName
        ) {
          // Conflit détecté
          console.log(`Conflit détecté pour le licencié ${licensee.userId}`);
          result.rejected.push(licensee);
        } else {
          // Licencié identique, ignorer
          console.log(`Licencié ${licensee.userId} ignoré (déjà présent)`);
          result.skipped++;
        }
      } else {
        // Nouveau licencié, l'insérer
        try {
          await executeQuery(
            `INSERT INTO licensees (userId, email, firstName, lastName) 
             VALUES ($1, $2, $3, $4)`,
            [licensee.userId, licensee.email, licensee.firstName, licensee.lastName]
          );
          console.log(`Licencié ${licensee.userId} importé avec succès`);
          result.imported++;
        } catch (error) {
          console.error(`Erreur lors de l'insertion du licencié ${licensee.userId}:`, error);
          result.rejected.push(licensee);
        }
      }
    }
    
    console.log('Résultat de l\'import:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 