'use client';

import Link from 'next/link';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  const environment = process.env.NODE_ENV;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header>
        <h1 className="text-3xl font-bold">Club de Squash</h1>
      </header>

      <main className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a 
            href="/reservation"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">Réserver un terrain</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Réservez un terrain de squash pour votre prochaine partie
            </p>
          </a>

          <Link 
            href={`/reservations?date=${today}`}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">Liste des réservations</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Consultez les réservations du jour
            </p>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 text-center text-sm text-gray-500">
        <div>
          <p>© 2024 Club de Squash. Tous droits réservés.</p>
          <p className="text-xs mt-1">Environnement : {environment}</p>
        </div>
      </footer>

      <div className="space-y-4">
        <Link
          href="/reservations"
          className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          Voir les réservations
        </Link>
        <Link
          href="/settings"
          className="block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
        >
          Paramètres
        </Link>
      </div>
    </div>
  );
}
