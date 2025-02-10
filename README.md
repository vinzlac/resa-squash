# Resa Squash

Application de gestion des réservations de terrains de squash construite avec [Next.js](https://nextjs.org).

## Configuration de la base de données

### Avec Docker (recommandé)

1. **Lancer PostgreSQL avec Docker**
```bash
docker run --name postgres-squash-local \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=default \
  -e POSTGRES_DB=verceldb \
  -p 5432:5432 \
  -d postgres
```

2. **Commandes Docker utiles**
```bash
# Vérifier que le conteneur est en cours d'exécution
docker ps

# Voir les logs du conteneur
docker logs postgres-squash-local

# Arrêter le conteneur
docker stop postgres-squash-local

# Redémarrer le conteneur
docker start postgres-squash-local

# Supprimer le conteneur (attention : cela effacera toutes les données)
docker rm -f postgres-squash-local

# Se connecter au shell PostgreSQL dans le conteneur
docker exec -it postgres-squash-local psql -U default -d verceldb
```

## Installation du projet

1. **Installer les dépendances**
```bash
docker ps
```

2. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :
```env
POSTGRES_URL="postgres://default:password@localhost:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:password@localhost:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:password@localhost:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="verceldb"
```

3. **Initialiser la base de données**
```bash
npm run init-db
```

## Développement

```bash
# Lancer le serveur de développement
npm run dev

# Construire l'application
npm run build

# Lancer les tests de linting
npm run lint

# Lancer en mode production
npm run start

# Lancer en mode debug
npm run debug
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

## Structure du projet

- `/app` - Code source de l'application
  - `/api` - Routes API
    - `/favorites` - Gestion des favoris
    - `/licensees` - Gestion des licenciés
    - `/reservations` - Gestion des réservations
  - `/types` - Types TypeScript
  - `/lib` - Utilitaires et configuration
- `/scripts` - Scripts utilitaires

## Base de données

La base de données stocke :
- Les favoris des utilisateurs
- Les associations entre utilisateurs et licenciés

### Tables

**favorites**
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  licensee_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, licensee_id)
);
```

## Déploiement

L'application est configurée pour être déployée sur [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). La base de données PostgreSQL sera automatiquement provisionnée par Vercel lors du déploiement.

Pour plus d'informations sur le déploiement, consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## En savoir plus

Pour en savoir plus sur Next.js :

- [Documentation Next.js](https://nextjs.org/docs) - découvrez les fonctionnalités de Next.js
- [Learn Next.js](https://nextjs.org/learn) - un tutoriel interactif Next.js

Ce projet utilise [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) pour optimiser et charger automatiquement [Geist](https://vercel.com/font), une nouvelle famille de polices pour Vercel.
