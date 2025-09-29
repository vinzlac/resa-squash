'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SelectedBooking {
  sessionId: string;
  beginTime: string;
  endTime: string;
  court: number;
  date: string;
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface SelectedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBookings: SelectedBooking[];
  onRemoveBooking: (sessionId: string) => void;
  currentDate: string;
  onRecopySuccess?: () => void;
}

export default function SelectedBookingModal({
  isOpen,
  onClose,
  selectedBookings,
  onRemoveBooking,
  currentDate,
  onRecopySuccess,
}: SelectedBookingModalProps) {
  const [isRecopying, setIsRecopying] = useState(false);
  const [recopyProgress, setRecopyProgress] = useState(0);

  if (!isOpen) return null;

  // Formatage de la date
  const formattedDate = currentDate ? format(new Date(currentDate), "EEEE d MMMM yyyy", { locale: fr }) : '';

  const previousDate = format(subDays(new Date(currentDate), 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(new Date(currentDate), 1), 'yyyy-MM-dd');
  const previousWeekDate = format(subDays(new Date(currentDate), 7), 'yyyy-MM-dd');
  const nextWeekDate = format(addDays(new Date(currentDate), 7), 'yyyy-MM-dd');

  const handleRecopy = async () => {
    if (selectedBookings.length === 0) return;

    setIsRecopying(true);
    setRecopyProgress(0);

    try {
      for (let i = 0; i < selectedBookings.length; i++) {
        const booking = selectedBookings[i];
        
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: booking.users.map(user => user.id),
            date: currentDate,
            beginTime: booking.beginTime,
            endTime: booking.endTime,
            court: booking.court
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la recopie du créneau ${booking.beginTime}-${booking.endTime} sur le terrain ${booking.court}`);
        }

        // Mettre à jour le progrès
        setRecopyProgress(((i + 1) / selectedBookings.length) * 100);
      }

      // Succès
      if (onRecopySuccess) {
        onRecopySuccess();
      }
      onClose();

    } catch (error) {
      console.error('Erreur lors de la recopie:', error);
      alert('Erreur lors de la recopie des créneaux: ' + (error as Error).message);
    } finally {
      setIsRecopying(false);
      setRecopyProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Créneaux sélectionnés ({selectedBookings.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sélecteur de date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/reservations?date=${previousWeekDate}`}
                className="text-blue-600 hover:text-blue-800 mr-2"
                title="Semaine précédente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Link>
              <Link
                href={`/reservations?date=${previousDate}`}
                className="text-blue-600 hover:text-blue-800"
                title="Jour précédent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {formattedDate}
            </h3>
            <div className="flex items-center">
              <Link
                href={`/reservations?date=${nextDate}`}
                className="text-blue-600 hover:text-blue-800"
                title="Jour suivant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={`/reservations?date=${nextWeekDate}`}
                className="text-blue-600 hover:text-blue-800 ml-2"
                title="Semaine suivante"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {selectedBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun créneau sélectionné
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map((booking) => (
                <div
                  key={booking.sessionId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Terrain {booking.court}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: fr })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.beginTime} - {booking.endTime}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {booking.users.map(user => `${user.firstName} ${user.lastName}`).join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveBooking(booking.sessionId)}
                    className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Retirer de la sélection"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          {/* Indicateur de progression */}
          {isRecopying && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Recopie en cours...
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {Math.round(recopyProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${recopyProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Recopier vers: {formattedDate}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRecopy}
                disabled={selectedBookings.length === 0 || isRecopying}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedBookings.length === 0 || isRecopying
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRecopying ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Recopie...</span>
                  </div>
                ) : (
                  'Recopier'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isRecopying}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
