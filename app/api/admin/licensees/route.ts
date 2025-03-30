import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('API admin/licenciés appelée');
    
    // Récupérer les licenciés de la base de données
    const dbLicensees = await executeQuery(`
      SELECT userId, email, firstName, lastName
      FROM licensees
      ORDER BY lastName, firstName
    `);
    
    // Normaliser les noms de champs pour correspondre au format attendu par le client
    const licensees = dbLicensees.map(licensee => ({
      userId: licensee.userid || licensee.userId,
      email: licensee.email,
      firstName: licensee.firstname || licensee.firstName,
      lastName: licensee.lastname || licensee.lastName
    }));
    
    console.log(`${licensees.length} licenciés récupérés`);
    
    return NextResponse.json(licensees);
  } catch (error) {
    console.error('Erreur lors de la récupération des licenciés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('API suppression de tous les licenciés appelée');
    
    // Compter le nombre de licenciés avant suppression
    const countResult = await executeQuery(`SELECT COUNT(*) FROM licensees`);
    const count = parseInt(countResult[0].count);
    
    // Supprimer tous les licenciés
    await executeQuery(`DELETE FROM licensees`);
    
    console.log(`${count} licenciés supprimés`);
    
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error('Erreur lors de la suppression des licenciés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 