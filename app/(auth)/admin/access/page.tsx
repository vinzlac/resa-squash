'use client';

import { useState, useEffect } from 'react';
import { Licensee } from '@/app/types/licensee';
import { AuthorizedUsersResponse } from '@/app/types/auth';

type SortDirection = 'asc' | 'desc';
type SortField = 'firstName' | 'lastName';

export default function AccessPage() {
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [licenseesResponse, authorizedResponse] = await Promise.all([
          fetch('/api/teamr/licensees'),
          fetch('/api/admin/authorized-users')
        ]);

        if (!licenseesResponse.ok || !authorizedResponse.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const licenseesData = await licenseesResponse.json();
        const authorizedData = await authorizedResponse.json() as AuthorizedUsersResponse;

        setLicensees(licenseesData);
        setAuthorizedUsers(authorizedData.emails);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleAccess = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Format d\'email invalide');
      return;
    }

    const action = authorizedUsers.includes(email) ? 'remove' : 'add';
    
    try {
      const response = await fetch('/api/admin/authorized-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          action
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des accès');
      }

      setAuthorizedUsers(prev => 
        action === 'add' 
          ? [...prev, email]
          : prev.filter(e => e !== email)
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des accès:', error);
      setErrorMessage('Erreur lors de la mise à jour des accès');
    }
  };

  const getFilteredLicensees = () => licensees.filter(licensee => 
    licensee.user[0]?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    licensee.user[0]?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAuthorizedLicensees = () => licensees.filter(licensee => 
    authorizedUsers.includes(licensee.user[0].email)
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
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Liste des utilisateurs autorisés */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Utilisateurs autorisés ({getAuthorizedLicensees().length})
                  </h2>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {getAuthorizedLicensees().map(licensee => (
                      <div
                        key={licensee.user[0]._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {licensee.user[0].firstName} {licensee.user[0].lastName}
                        </span>
                        <button
                          onClick={() => handleToggleAccess(licensee.user[0].email)}
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
                    {getAuthorizedLicensees().length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                        Aucun utilisateur autorisé
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sélection des utilisateurs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Sélection des utilisateurs
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
                                onClick={() => handleToggleAccess(licensee.user[0].email)}
                                className={`p-2 rounded ${
                                  authorizedUsers.includes(licensee.user[0].email)
                                    ? 'text-green-500 hover:text-green-600'
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill={authorizedUsers.includes(licensee.user[0].email) ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
        )}
      </div>
    </div>
  );
} 