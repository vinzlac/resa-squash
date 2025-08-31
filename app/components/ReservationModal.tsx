'use client';

import { TrLicensee } from '@/app/types/TrLicencees';
import { useState, useEffect } from 'react';
import { useConnectedUser } from '@/app/hooks/useConnectedUser';
import { toast } from 'react-hot-toast';
import { useUserRights } from '@/app/hooks/useUserRights';
import { useUserStore } from '@/app/stores/userStore';
import DeleteReservationModal from '@/app/components/DeleteReservationModal';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionId: string;
  date: string;
  time: string;
  timeSlot: { users: { id: string }[] };
}

export default function ReservationModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  date,
  time,
  timeSlot,
}: ReservationModalProps) {
  const user = useConnectedUser();
  const connectedUserId = user?.userId;
  const { isPowerUser } = useUserRights();
  const hasPowerUserRights = isPowerUser();
  const userStore = useUserStore();
  const connectedUserFullName = userStore.user ? `${userStore.user.firstName} ${userStore.user.lastName}` : '';
  const [favorites, setFavorites] = useState<string[]>([]);
  const [licensees, setLicensees] = useState<TrLicensee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [useConnectedUserAsPlayer, setUseConnectedUserAsPlayer] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [startDate] = useState<Date>(() => {
    try {
      console.log('Date reçue:', date);
      console.log('Heure reçue:', time);
      
      // S'assurer que la date est au format YYYY-MM-DD
      const formattedDate = date.split('T')[0];
      // Convertir le format de l'heure de "HH'H'MM" en "HH:MM"
      const formattedTime = time.replace('H', ':');
      
      const dateObj = new Date(formattedDate + 'T' + formattedTime + ':00');
      console.log('Date après parsing:', dateObj);
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Date invalide');
      }
      
      console.log('Date finale:', dateObj);
      
      return dateObj;
    } catch (error) {
      console.error('Erreur lors de la création de la date:', error);
      return new Date(); // Fallback à la date actuelle en cas d'erreur
    }
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || hasLoaded) return;

      try {
        setIsLoading(true);
        const [licenseesResponse, favoritesResponse] = await Promise.all([
          fetch('/api/teamr/licensees'),
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
  }, [isOpen, hasLoaded]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setSelectedPartnerId('');
      setUseConnectedUserAsPlayer(true);
      setError(null);
      setHasLoaded(false);
    } else {
      setSelectedUserId(connectedUserId || '');
    }
  }, [isOpen, connectedUserId]);

  const getFavoriteLicensees = () => licensees.filter(licensee => 
    favorites.includes(licensee.user[0]._id)
  );

  const handleReservation = async () => {
    try {
      setIsLoading(true);
      const userId = hasPowerUserRights && !useConnectedUserAsPlayer ? selectedUserId : connectedUserId;
      
      console.log('Date avant envoi:', startDate);
      console.log('Date ISO:', startDate.toISOString());
      
      if (isNaN(startDate.getTime())) {
        throw new Error('Date de réservation invalide');
      }

      const response = await fetch(`/api/reservations/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          partnerId: selectedPartnerId,
          startDate: startDate.toISOString()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error.message);
        return;
      }

      toast.success('Réservation effectuée avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error('Une erreur est survenue lors de la réservation');
    } finally {
      setIsLoading(false);
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
            {hasPowerUserRights && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Premier joueur :
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="useConnectedUser"
                    checked={useConnectedUserAsPlayer}
                    onChange={(e) => setUseConnectedUserAsPlayer(e.target.checked)}
                    className="rounded dark:bg-gray-700"
                  />
                  <label htmlFor="useConnectedUser" className="text-sm">
                    Utiliser mon compte ({connectedUserFullName})
                  </label>
                </div>
                
                {!useConnectedUserAsPlayer && (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Choisir un joueur</option>
                    {getFavoriteLicensees().map(licensee => (
                      <option key={licensee.user[0]._id} value={licensee.user[0]._id}>
                        {licensee.user[0].firstName} {licensee.user[0].lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {hasPowerUserRights ? 'Deuxième joueur :' : 'Partenaire :'}
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Choisir un partenaire</option>
                {getFavoriteLicensees().map(licensee => (
                  <option 
                    key={licensee.user[0]._id} 
                    value={licensee.user[0]._id}
                    disabled={
                      (useConnectedUserAsPlayer && licensee.user[0]._id === connectedUserId) || 
                      (!useConnectedUserAsPlayer && hasPowerUserRights && licensee.user[0]._id === selectedUserId)
                    }
                  >
                    {licensee.user[0].firstName} {licensee.user[0].lastName}
                    {((useConnectedUserAsPlayer && licensee.user[0]._id === connectedUserId) || 
                      (!useConnectedUserAsPlayer && hasPowerUserRights && licensee.user[0]._id === selectedUserId)) 
                      ? ' (déjà sélectionné)' : ''}
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
                onClick={handleReservation}
                disabled={!selectedPartnerId || (!useConnectedUserAsPlayer && hasPowerUserRights && !selectedUserId)}
                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  (selectedPartnerId && (useConnectedUserAsPlayer || !hasPowerUserRights || selectedUserId))
                    ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        )}

        {timeSlot && timeSlot.users && timeSlot.users.length > 0 && (
          <DeleteReservationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={onSuccess}
            sessionId={sessionId}
            date={date}
            time={time}
            mainUserId={timeSlot.users[0].id}
            partnerId={timeSlot.users[1].id}
            startDate={startDate}
          />
        )}
      </div>
    </div>
  );
} 