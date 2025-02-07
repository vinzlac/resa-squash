export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center">
          Club de Squash
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Bienvenue sur votre espace de réservation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <a 
            href="/reservation"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Nouvelle Réservation</h2>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Réservez un terrain pour votre prochaine partie
            </p>
          </a>

          <a 
            href="/reservations"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Liste des Réservations</h2>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Consultez les réservations du jour
            </p>
          </a>
        </div>
      </main>

      <footer className="row-start-3 text-center text-sm text-gray-500">
        <p>© 2024 Club de Squash. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
