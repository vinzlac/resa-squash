'use client';

import { useConnectedUser } from '@/app/hooks/useConnectedUser';

interface DeleteReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  partnerId: string;
  onSuccess: () => void;
  time: string;
}

export default function DeleteReservationModal({
  isOpen,
  onClose,
  sessionId,
  partnerId,
  onSuccess,
  time,
}: DeleteReservationModalProps) {
  const user = useConnectedUser();
  const userId = user?.userId;

  const handleDelete = async () => {
    try {
      if (!userId) {
        console.error('User not connected');
        return;
      }

      const response = await fetch(`/api/reservations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, partnerId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la réservation');
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">
          Confirmer la suppression de la réservation de {time} ?
        </h3>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
} 