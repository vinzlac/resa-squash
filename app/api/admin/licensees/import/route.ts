import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { executeQuery } from '@/app/lib/db';
import { fetchAllLicenseesByEmail } from '@/app/services/common';
import { getGlobalTeamrToken } from '@/app/services/common';
import { extractTeamrToken } from '@/app/utils/auth';
import { NextRequest } from 'next/server';
import { Licensee } from '@/app/types/licensee';

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  rejected: Licensee[];
  totalProcessed: number;
  totalToProcess: number;
  batchSize: number;
  currentBatch: number;
  hasMore: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('API admin/import licenciés appelée');
    
    // Récupérer le paramètre de page et la taille du lot depuis la requête
    const searchParams = request.nextUrl.searchParams;
    const batch = parseInt(searchParams.get('batch') || '1', 10);
    const batchSize = parseInt(searchParams.get('batchSize') || '50', 10);
    
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
        updated: 0,
        skipped: existingLicensees.length,
        rejected: [],
        totalProcessed: existingLicensees.length,
        totalToProcess: existingLicensees.length,
        batchSize,
        currentBatch: batch,
        hasMore: false
      });
    }
    
    // Récupérer tous les licenciés de TeamR
    const teamrLicensees = await fetchAllLicenseesByEmail(token);
    console.log(`${teamrLicensees.size} licenciés récupérés depuis TeamR`);
    
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      rejected: [],
      totalProcessed: 0,
      totalToProcess: teamrLicensees.size,
      batchSize,
      currentBatch: batch,
      hasMore: false
    };
    
    // Récupérer tous les licenciés actuels de la base de données
    const existingLicensees = await executeQuery('SELECT userId, email, firstName, lastName FROM licensees');
    const existingLicenseesMap = new Map<string, Licensee>();
    
    // Convertir les résultats en Map pour faciliter la recherche
    existingLicensees.forEach((licensee: Licensee) => {
      existingLicenseesMap.set(licensee.userId, licensee);
    });
    
    // Convertir la Map en tableau et trier par email pour garantir une consistance entre les appels
    const licenseeArray = Array.from(teamrLicensees.values())
      .filter(licenseeTR => licenseeTR.user && licenseeTR.user[0] && licenseeTR.user[0].email)
      .sort((a, b) => {
        const emailA = a.user[0].email.toLowerCase();
        const emailB = b.user[0].email.toLowerCase();
        return emailA.localeCompare(emailB);
      });
    
    // Calculer les indices de début et de fin pour le lot actuel
    const startIndex = (batch - 1) * batchSize;
    const endIndex = Math.min(startIndex + batchSize, licenseeArray.length);
    const currentBatchLicensees = licenseeArray.slice(startIndex, endIndex);
    
    // Vérifier s'il y a d'autres lots après celui-ci
    result.hasMore = endIndex < licenseeArray.length;
    result.totalProcessed = Math.min(endIndex, licenseeArray.length);
    result.totalToProcess = licenseeArray.length; // Mettre à jour avec le nombre réel après filtrage
    
    // Traiter chaque licencié TeamR du lot actuel
    for (const licenseeTR of currentBatchLicensees) {
      if (!licenseeTR.user || !licenseeTR.user[0]) continue;
      
      const user = licenseeTR.user[0];
      
      const licensee: Licensee = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      try {
        // Utiliser UPSERT (INSERT ... ON CONFLICT ... DO UPDATE)
        // Cette requête va:
        // 1. Insérer le licencié s'il n'existe pas
        // 2. Mettre à jour le licencié s'il existe déjà avec des informations différentes
        // 3. Ne rien faire si le licencié existe déjà avec les mêmes informations
        const updateResult = await executeQuery(
          `INSERT INTO licensees (userId, email, firstName, lastName) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (userId) DO UPDATE 
           SET email = EXCLUDED.email, 
               firstName = EXCLUDED.firstName, 
               lastName = EXCLUDED.lastName
           WHERE 
             licensees.email != EXCLUDED.email OR 
             licensees.firstName != EXCLUDED.firstName OR 
             licensees.lastName != EXCLUDED.lastName
           RETURNING 
             (xmax = 0) AS inserted,
             (xmax <> 0 AND xmax::text <> '0') AS updated`,
          [licensee.userId, licensee.email, licensee.firstName, licensee.lastName]
        );
        
        if (updateResult.length === 0) {
          // Aucune modification (licencié identique)
          console.log(`Licencié ${licensee.userId} ignoré (déjà présent et identique)`);
          result.skipped++;
        } else if (updateResult[0].inserted) {
          // Nouveau licencié inséré
          console.log(`Licencié ${licensee.userId} importé avec succès`);
          result.imported++;
        } else if (updateResult[0].updated) {
          // Licencié existant mis à jour
          console.log(`Licencié ${licensee.userId} mis à jour avec succès`);
          result.updated++;
        } else {
          // Ce cas ne devrait pas arriver
          console.log(`Licencié ${licensee.userId} traité mais aucune action spécifique`);
          result.skipped++;
        }
      } catch (error) {
        console.error(`Erreur lors du traitement du licencié ${licensee.userId}:`, error);
        result.rejected.push(licensee);
      }
    }
    
    console.log('Résultat de l\'import (lot', batch, '):', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 