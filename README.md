# Resa Squash

Application de réservation de courts de squash.

## Prérequis

- Node.js 18+
- PostgreSQL
- Compte TeamR

## Installation

1. Cloner le repository
```bash
git clone https://github.com/yourusername/resa-squash.git
cd resa-squash
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```
Remplir les variables dans `.env.local` avec vos informations.

4. Initialiser la base de données
```bash
npm run init-db
```

## Développement

Pour lancer le serveur de développement avec le serveur personnalisé (inclut l'initialisation des maps des licenciés) :
```bash
npm run dev
```

Pour lancer avec le débogueur Node.js :
```bash
npm run debug
```

Pour lancer postgresql en docker avec docker-compose
```bash
# Démarrer le service PostgreSQL
docker-compose up -d

# Arrêter le service
docker-compose down

# Arrêter et supprimer les volumes (attention, cela supprime les données)
docker-compose down -v
```

## Production

Pour construire et lancer l'application en production localement :
```bash
npm run build
npm run start:custom
```

## Déploiement sur Vercel

L'application est configurée pour être déployée sur Vercel. Sur Vercel :
- La commande `build` construit l'application
- La commande `start` lance le serveur Next.js standard
- Le serveur personnalisé (`server.ts`) n'est pas utilisé

Pour plus de détails sur le déploiement, consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/deployment).

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement avec le serveur personnalisé
- `npm run debug` : Lance le serveur avec le débogueur Node.js
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance le serveur Next.js standard (utilisé par Vercel)
- `npm run start:custom` : Lance le serveur personnalisé en production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run init-db` : Initialise la base de données
- `npm run migrate` : Exécute les migrations de la base de données

## Structure du projet

```
resa-squash/
├── app/
│   ├── api/           # Routes API
│   ├── components/    # Composants React
│   ├── lib/          # Utilitaires et configurations
│   ├── services/     # Services et logique métier
│   └── types/        # Types TypeScript
├── public/           # Fichiers statiques
├── scripts/          # Scripts utilitaires
└── server.ts         # Serveur personnalisé (utilisé uniquement en développement local)
```

## Fonctionnalités

- Authentification avec TeamR
- Réservation de courts de squash
- Gestion des favoris
- Interface utilisateur responsive
- Gestion des erreurs et notifications

## Technologies utilisées

- Next.js 15
- React 19
- TypeScript
- PostgreSQL
- TailwindCSS
- NextAuth.js
- Zustand (gestion d'état)

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT
