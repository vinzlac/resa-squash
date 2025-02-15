'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si le cookie existe
        const response = await fetch('/api/auth/check', { method: 'GET' });
        
        if (!response.ok) {
          useUserStore.getState().setUser(null);
          router.replace('/login');
          return;
        }

        // Vérifier que nous avons les données utilisateur
        if (!user) {
          router.replace('/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur de vérification:', error);
        useUserStore.getState().setUser(null);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [user, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Profil
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Informations personnelles
            </h3>
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
        </div>
      </div>
    </div>
  );
} 