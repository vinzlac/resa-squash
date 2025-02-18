export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Accès non autorisé
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette application. 
            Veuillez contacter l&apos;administrateur pour obtenir un accès.
          </p>
        </div>
        <div>
          <a
            href="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Retour à la page de connexion
          </a>
        </div>
      </div>
    </div>
  );
} 