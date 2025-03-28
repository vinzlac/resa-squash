'use client';

import { useConnectedUser } from '@/app/hooks/useConnectedUser';
import { useUserRights } from '@/app/hooks/useUserRights';
import { useState } from 'react';

interface DeleteReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionId: string;
  date: string;
  time: string;
  mainUserId?: string; // ID du user principal de la réservation
  partnerId: string;
  startDate: Date;
}

export default function DeleteReservationModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  date,
  time,
  mainUserId,
  partnerId,
  startDate,
}: DeleteReservationModalProps) {
  const user = useConnectedUser();
  const connectedUserId = user?.userId;
  const { isPowerUser } = useUserRights();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!connectedUserId) {
        throw new Error('Utilisateur non connecté');
      }

      // Si l'utilisateur n'a pas de droits POWER_USER, utiliser toujours l'utilisateur connecté
      const userIdToUse = isPowerUser() && mainUserId ? mainUserId : connectedUserId;

      const response = await fetch(`/api/reservations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          partnerId: partnerId,
          startDate: startDate.toISOString()
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Erreur lors de la suppression');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Supprimer la réservation</h2>
        <p className="mb-4">
          Êtes-vous sûr de vouloir supprimer la réservation pour le {date} à {time} ?
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
} 