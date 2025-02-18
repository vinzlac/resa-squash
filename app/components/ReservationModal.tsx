'use client';

import { Licensee } from '@/app/types/licensee';
import { useState, useEffect } from 'react';
import { useConnectedUser } from '@/app/hooks/useConnectedUser';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  time: string;
  onConfirm: (participantId: string) => void;
}

export default function ReservationModal({ isOpen, onClose, sessionId, time, onConfirm }: ReservationModalProps) {
  const user = useConnectedUser();
  const userId = user?.userId;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {

      if (!isOpen || hasLoaded) return;

      try {
        setIsLoading(true);
        const [licenseesResponse, favoritesResponse] = await Promise.all([
          fetch('/api/licensees'),
          fetch(`/api/favorites`)
        ]);

        if (!licenseesResponse.ok || !favoritesResponse.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const licenseesData = await licenseesResponse.json();
        const favoritesData = await favoritesResponse.json();

        setLicensees(licenseesData);
        setFavorites(favoritesData);
        setHasLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, hasLoaded, userId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedParticipant('');
      setError(null);
      setHasLoaded(false);
    }
  }, [isOpen]);

  const getFavoriteLicensees = () => licensees.filter(licensee => 
    favorites.includes(licensee.user[0]._id)
  );

  const handleConfirm = async () => {
    try {
      if (!userId) {
        console.error('User not connected');
        return;
      }

      const response = await fetch(`/api/reservations/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, partnerId: selectedParticipant }),
      });

      if (response.ok) {
        onConfirm(selectedParticipant);
      } else {
        console.error('Erreur lors de la réservation:', await response.json());
        // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Fermer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4">Réserver un créneau</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Créneau de {time}
        </p>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sélectionnez un partenaire parmi vos favoris :
              </label>
              <select
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Choisir un partenaire</option>
                {getFavoriteLicensees().map(licensee => (
                  <option key={licensee.user[0]._id} value={licensee.user[0]._id}>
                    {licensee.user[0].firstName} {licensee.user[0].lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedParticipant}
                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  selectedParticipant
                    ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 