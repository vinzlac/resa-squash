'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Licensee } from '@/app/types/licensee';

type SortDirection = 'asc' | 'desc';
type SortField = 'firstName' | 'lastName';

function FavoritesContent() {
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Utilisez un ID utilisateur temporaire pour le développement
  const userId = "default-user"; // À remplacer par l'authentification réelle

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [licenseesResponse, favoritesResponse] = await Promise.all([
          fetch('/api/licensees'),
          fetch(`/api/favorites?userId=${userId}`)
        ]);

        if (!licenseesResponse.ok || !favoritesResponse.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const licenseesData = await licenseesResponse.json();
        const favoritesData = await favoritesResponse.json();

        setLicensees(licenseesData);
        setFavorites(favoritesData);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleToggleFavorite = async (licenseeId: string) => {
    const action = favorites.includes(licenseeId) ? 'remove' : 'add';
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          licenseeId,
          action
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des favoris');
      }

      setFavorites(prev => 
        action === 'add' 
          ? [...prev, licenseeId]
          : prev.filter(id => id !== licenseeId)
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      setErrorMessage('Erreur lors de la mise à jour des favoris');
    }
  };

  const getFilteredLicensees = () => licensees.filter(licensee => 
    licensee.user[0]?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    licensee.user[0]?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFavoriteLicensees = () => licensees.filter(licensee => 
    favorites.includes(licensee.user[0]._id)
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux paramètres
        </Link>

        <h1 className="text-3xl font-bold mb-8">Gestion des favoris</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Vos favoris ({getFavoriteLicensees().length})
              </h2>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {getFavoriteLicensees().map(licensee => (
                  <div
                    key={licensee.user[0]._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {licensee.user[0].firstName} {licensee.user[0].lastName}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(licensee.user[0]._id)}
                      className="p-2 rounded text-red-500 hover:text-red-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {getFavoriteLicensees().length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                    Aucun favori sélectionné
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Sélection des favoris
              </h2>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="Rechercher un licencié..."
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : errorMessage ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                  {errorMessage}
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 mb-4 font-semibold sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <button 
                      onClick={() => handleSort('firstName')}
                      className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded"
                    >
                      <span>Prénom</span>
                      {sortField === 'firstName' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={() => handleSort('lastName')}
                      className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded"
                    >
                      <span>Nom</span>
                      {sortField === 'lastName' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {getFilteredLicensees()
                    .sort((a, b) => {
                      const aValue = a.user[0][sortField].toLowerCase();
                      const bValue = b.user[0][sortField].toLowerCase();
                      return sortDirection === 'asc' 
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                    })
                    .map(licensee => (
                      <div
                        key={licensee.user[0]._id}
                        className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded items-center"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {licensee.user[0].firstName}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 dark:text-white">
                            {licensee.user[0].lastName}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(licensee.user[0]._id)}
                            className={`p-2 rounded ${
                              favorites.includes(licensee.user[0]._id)
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            <svg
                              className="w-6 h-6"
                              fill={favorites.includes(licensee.user[0]._id) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Favorites = () => <FavoritesContent />;
export default Favorites; 