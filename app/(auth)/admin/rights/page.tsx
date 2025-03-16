'use client';

import React, { useState, useEffect } from 'react';
import { UserWithName, UserRight, UserRights } from '@/app/types/rights';

export default function AdminRightsPage() {
  const [users, setUsers] = useState<UserWithName[]>([]);
  const [userRights, setUserRights] = useState<UserRights[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithName | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/user-rights');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setUserRights(data.userRights);
        
        // Select first user by default if available
        if (data.users.length > 0) {
          setSelectedUser(data.users[0]);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setErrorMessage('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getUserRightsById = (userId: string): UserRight[] => {
    const userRightEntry = userRights.find(ur => ur.userId === userId);
    return userRightEntry ? userRightEntry.rights : [];
  };

  const handleUserSelect = (user: UserWithName) => {
    setSelectedUser(user);
  };

  const handleAddRight = async (right: UserRight) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch('/api/admin/user-rights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          right,
          action: 'add'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du droit');
      }
      
      // Update local state
      setUserRights(prev => {
        const existingUserRightIndex = prev.findIndex(ur => ur.userId === selectedUser.id);
        
        if (existingUserRightIndex >= 0) {
          // User already has some rights, add the new one
          const updatedUserRights = [...prev];
          const currentRights = [...updatedUserRights[existingUserRightIndex].rights];
          
          if (!currentRights.includes(right)) {
            updatedUserRights[existingUserRightIndex] = {
              ...updatedUserRights[existingUserRightIndex],
              rights: [...currentRights, right]
            };
          }
          
          return updatedUserRights;
        } else {
          // User has no rights yet, create a new entry
          return [...prev, { userId: selectedUser.id, rights: [right] }];
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage('Erreur lors de l\'ajout du droit');
    }
  };

  const handleRemoveRight = async (right: UserRight) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch('/api/admin/user-rights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          right,
          action: 'remove'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du droit');
      }
      
      // Update local state
      setUserRights(prev => {
        const existingUserRightIndex = prev.findIndex(ur => ur.userId === selectedUser.id);
        
        if (existingUserRightIndex >= 0) {
          const updatedUserRights = [...prev];
          const currentRights = [...updatedUserRights[existingUserRightIndex].rights];
          
          updatedUserRights[existingUserRightIndex] = {
            ...updatedUserRights[existingUserRightIndex],
            rights: currentRights.filter(r => r !== right)
          };
          
          return updatedUserRights;
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage('Erreur lors de la suppression du droit');
    }
  };

  const getAssignedRights = (): UserRight[] => {
    if (!selectedUser) return [];
    return getUserRightsById(selectedUser.id);
  };

  const getUnassignedRights = (): UserRight[] => {
    if (!selectedUser) return Object.values(UserRight);
    
    const assignedRights = getUserRightsById(selectedUser.id);
    return Object.values(UserRight).filter(right => !assignedRights.includes(right));
  };

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Gestion des droits
            </h2>
            
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Liste des utilisateurs autorisés */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-md leading-6 font-medium text-gray-900 dark:text-white">
                    Utilisateurs autorisés ({users.length})
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur autorisé</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map(user => (
                        <li 
                          key={user.id}
                          className={`py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.lastName} {user.firstName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Liste des droits attribués */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-md leading-6 font-medium text-gray-900 dark:text-white">
                    Droits attribués {selectedUser ? `à ${selectedUser.firstName} ${selectedUser.lastName}` : ''}
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
                  {!selectedUser ? (
                    <p className="text-gray-500 dark:text-gray-400">Sélectionnez un utilisateur</p>
                  ) : getAssignedRights().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Aucun droit attribué</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getAssignedRights().map(right => (
                        <li key={right} className="py-3 px-2">
                          <div className="flex items-center justify-between">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {right === UserRight.ADMIN ? 'Administrateur' : 'Utilisateur avancé'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveRight(right)}
                              className="p-2 rounded text-red-500 hover:text-red-600"
                              title="Supprimer ce droit"
                            >
                              <svg
                                className="w-5 h-5"
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Liste des droits non attribués */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-md leading-6 font-medium text-gray-900 dark:text-white">
                    Droits disponibles {selectedUser ? `pour ${selectedUser.firstName} ${selectedUser.lastName}` : ''}
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
                  {!selectedUser ? (
                    <p className="text-gray-500 dark:text-gray-400">Sélectionnez un utilisateur</p>
                  ) : getUnassignedRights().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Tous les droits sont déjà attribués</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getUnassignedRights().map(right => (
                        <li key={right} className="py-3 px-2">
                          <div className="flex items-center justify-between">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {right === UserRight.ADMIN ? 'Administrateur' : 'Utilisateur avancé'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddRight(right)}
                              className="p-2 rounded text-green-500 hover:text-green-600"
                              title="Ajouter ce droit"
                            >
                              <svg
                                className="w-5 h-5"
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
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
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