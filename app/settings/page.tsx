'use client';

import Link from 'next/link';

function SettingsContent() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

        <div className="space-y-4">
          <Link
            href="/favorites"
            className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Favoris</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gérer vos joueurs favoris
                </p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Autres options de paramètres peuvent être ajoutées ici */}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <SettingsContent />
  );
} 