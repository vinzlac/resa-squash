"use client";

import Link from "next/link";
import ServerLogger from "./components/ServerLogger";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const environment = process.env.NODE_ENV;
  const buildDate =
    process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

  // Log des variables d'environnement

  console.log("Environment variables in Home:");
  console.log("NODE_ENV:", process.env.NODE_ENV); 
  console.log("DATABASE_TYPE:", process.env.DATABASE_TYPE);
  console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
  console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
  console.log("POSTGRES_DATABASE:", process.env.POSTGRES_DATABASE);
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
  console.log("POSTGRES_PRISMA_URL:", process.env.POSTGRES_PRISMA_URL);
  console.log(
    "POSTGRES_URL_NON_POOLING:",
    process.env.POSTGRES_URL_NON_POOLING
  );

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ServerLogger />
      <header>
        <h1 className="text-3xl font-bold">Club de Squash</h1>
      </header>

      <main className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/reservation"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">Réserver un terrain</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Réservez un terrain de squash pour votre prochaine partie
            </p>
          </Link>

          <Link
            href={`/reservations?date=${today}`}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">
              Liste des réservations
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Consultez les réservations du jour
            </p>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">Paramètres</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Gérez vos préférences
            </p>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 text-center text-sm text-gray-500">
        <div>
          <p>© 2024 Club de Squash. Tous droits réservés.</p>
          <p className="text-xs mt-1">
            Environnement : {environment} (
            {new Date(buildDate).toLocaleString("fr-FR")})
          </p>
        </div>
      </footer>
    </div>
  );
}
