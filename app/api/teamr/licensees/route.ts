import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/allLicencies.json");
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Erreur lors de la lecture des licenciés:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer la liste des licenciés' },
      { status: 500 }
    );
  }
} 