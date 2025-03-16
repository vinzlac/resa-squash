'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserRights } from '@/app/hooks/useUserRights';
import { UserRight } from '@/app/types/rights';

// Fonction pour obtenir le libellé d'un droit
const getRightLabel = (right: UserRight): string => {
  switch (right) {
    case UserRight.ADMIN:
      return 'Administrateur';
    case UserRight.POWER_USER:
      return 'Utilisateur avancé';
    default:
      return right;
  }
};

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const { rights } = useUserRights();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Informations personnelles
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nom
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {user.lastName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Prénom
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {user.firstName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {user.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date de naissance
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {new Date(user.DOB).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Section des droits utilisateur */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Droits utilisateur
            </h2>
            <div className="mt-4">
              {rights.length > 0 ? (
                <ul className="space-y-2">
                  {rights.map((right) => (
                    <li 
                      key={right}
                      className="flex items-center text-gray-900 dark:text-white"
                    >
                      <svg 
                        className="w-5 h-5 text-green-500 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {getRightLabel(right)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun droit spécifique attribué
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 