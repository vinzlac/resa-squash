import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { ensureLicenseesMapByEmailIsInitialized, ensureLicenseesMapByUserIdIsInitialized } from './app/services/common';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function initializeMaps() {
  console.log('🔄 Initialisation des maps des licenciés...');
  try {
    await Promise.all([
      ensureLicenseesMapByEmailIsInitialized(),
      ensureLicenseesMapByUserIdIsInitialized()
    ]);
    console.log('✅ Maps des licenciés initialisées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des maps:', error);
  }
}

app.prepare().then(async () => {
  // Initialiser les maps avant de démarrer le serveur
  await initializeMaps();

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log('🚀 Server is started on http://localhost:3000');
  });
}); 