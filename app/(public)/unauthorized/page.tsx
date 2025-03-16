'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-8">
        <svg 
          className="w-24 h-24 mx-auto text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Accès non autorisé</h1>
      <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
        Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
} 