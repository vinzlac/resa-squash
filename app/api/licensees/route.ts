import { NextResponse } from 'next/server';
import { getAllLicensees } from '@/app/lib/db';
import { Licensee } from '@/app/types/licensee';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('API licensees publique appelée - version 2');
    
    // Essayer d'abord de récupérer depuis la base de données
    let licensees: Licensee[] = [];
    try {
      licensees = await getAllLicensees();
      console.log(`${licensees.length} licenciés récupérés depuis la DB`);
    } catch (dbError) {
      console.log('Erreur DB, utilisation du fichier JSON:', dbError);
    }
    
    // Si la base de données est vide, utiliser le fichier JSON
    if (licensees.length === 0) {
      try {
        const jsonPath = path.join(process.cwd(), 'public', 'allLicencies.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const teamrLicensees = JSON.parse(jsonData);
        
        // Transformer les données TeamR en format local
        licensees = teamrLicensees.map((licensee: { user?: Array<{ _id: string; email: string; firstName: string; lastName: string }> }) => {
          if (licensee.user && licensee.user.length > 0) {
            const user = licensee.user[0];
            return {
              userId: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            };
          }
          return null;
        }).filter((l: Licensee | null) => l !== null);
        
        console.log(`${licensees.length} licenciés récupérés depuis le fichier JSON`);
      } catch (fileError) {
        console.error('Erreur lors de la lecture du fichier JSON:', fileError);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }
    }
    
    return NextResponse.json(licensees);
  } catch (error) {
    console.error('Erreur lors de la récupération des licenciés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
