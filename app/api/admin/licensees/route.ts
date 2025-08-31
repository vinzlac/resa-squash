import { NextResponse } from 'next/server';
import { executeQuery, getAllLicensees } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('API admin/licencees appelée');
    
    // Utiliser la fonction centralisée pour récupérer les licenciés
    const licensees = await getAllLicensees();
    
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