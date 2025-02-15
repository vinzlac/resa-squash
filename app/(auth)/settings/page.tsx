'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <Link
            href="/settings/favorites"
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