'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';

export default function HomeContent() {
  const [pageData, setPageData] = useState({
    today: '',
    buildDate: '',
    environment: ''
  });

  useEffect(() => {
    setPageData({
      today: new Date().toISOString().split("T")[0],
      buildDate: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }, []);

  return (
    <>
      <main className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href={`/reservations?date=${pageData.today}`}
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
              Réservations
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
              Consultez les réservations du jour
            </p>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 text-center text-sm text-gray-500">
        <div>
          <p>© 2024 Club de Squash. Tous droits réservés.</p>
          {pageData.buildDate && (
            <p className="text-xs mt-1">
              Environnement : {pageData.environment} ({new Date(pageData.buildDate).toLocaleString("fr-FR")})
            </p>
          )}
        </div>
      </footer>
    </>
  );
} 