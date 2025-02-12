'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Reservation, User } from '@/app/types/reservation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, addDays, subDays, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationModal from '@/app/components/ReservationModal';
import { connectedUser } from '@/app/services/connectedUser';

interface ReservationByTimeSlot {
  time: string;
  users: User[];
  sessionId: string;
}

function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Formatage de la date
  const formattedDate = date ? format(new Date(date), "EEEE d MMMM yyyy", { locale: fr }) : '';

  const previousDate = format(subDays(new Date(date), 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(new Date(date), 1), 'yyyy-MM-dd');

  const isDatePassed = isBefore(startOfDay(new Date(date)), startOfDay(new Date()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ sessionId: string; time: string } | null>(null);

  // Utiliser useRef pour stocker la date actuelle
  const currentDateRef = useRef(date);

  // Mémoriser fetchReservations sans dépendance à date
  const fetchReservations = useCallback(async () => {
    try {
      console.log('%c Calling GET /reservations with URL:', 'color: #bada55', `/api/reservations?date=${currentDateRef.current}`);
      const response = await fetch(`/api/reservations?date=${currentDateRef.current}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réservations');
      }
      
      const data = await response.json();
      console.log('%c Received data:', 'color: #bada55', data);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []); // Plus de dépendance à date

  // Mettre à jour la ref et déclencher le fetch quand la date change
  useEffect(() => {
    currentDateRef.current = date;
    fetchReservations();
  }, [date, fetchReservations]);

  // Regrouper les réservations par terrain
  const reservationsByCourtNumber: { [courtNumber: number]: ReservationByTimeSlot[] } = {};

  reservations.forEach((reservation) => {
    if (!reservationsByCourtNumber[reservation.court]) {
      reservationsByCourtNumber[reservation.court] = [];
    }

    const existingTimeSlot = reservationsByCourtNumber[reservation.court].find(
      (slot) => slot.time === reservation.time
    );

    if (existingTimeSlot) {
      existingTimeSlot.users = [...existingTimeSlot.users, ...reservation.users];
    } else {
      reservationsByCourtNumber[reservation.court].push({
        time: reservation.time,
        sessionId: reservation.id.toString(),
        users: reservation.available ? [] : reservation.users,
      });
    }
    console.log('reservation:', reservation);
  });

  const handleReservationClick = (sessionId: string, time: string) => {
    setSelectedSlot({ sessionId, time });
    setIsModalOpen(true);
  };

  const handleReservationConfirm = async (participant2Id: string) => {
    if (!selectedSlot) return;

    try {
      // Ici, ajoutez la logique pour créer la réservation
      console.log('Réservation confirmée:', {
        sessionId: selectedSlot.sessionId,
        time: selectedSlot.time,
        participant1: connectedUser.id,
        participant2: participant2Id
      });
      
      setIsModalOpen(false);
      setSelectedSlot(null);
      // Rafraîchir les réservations après confirmation
      fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
    }
  };

  // Dans le rendu des créneaux, ajoutez l'icône "+" pour les créneaux disponibles
  const renderTimeSlot = (courtId: string, time: string) => {
    const timeSlot = reservationsByCourtNumber[parseInt(courtId)]?.find(
      slot => slot.time === time
    );
    
    if (isDatePassed) {
      return (
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="text-gray-500 dark:text-gray-400">
            {timeSlot?.users.length ? timeSlot.users.map(user => `${user.firstName} ${user.lastName}`).join(', ') : 'Personne'}
          </span>
        </div>
      );
    }
    
    if (timeSlot) {
      console.log('timeSlot:', timeSlot);
      return (
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
          {timeSlot.users.length === 0 ? (
            <div className="flex justify-between items-center">
              <span className="text-green-600 dark:text-green-400">Disponible</span>
              <button
                onClick={() => handleReservationClick(timeSlot.sessionId, timeSlot.time)}
                className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <span className="text-gray-900 dark:text-white">
              {timeSlot.users.map(user => `${user.firstName} ${user.lastName}`).join(', ')}
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l&apos;accueil
        </Link>

        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/reservations?date=${previousDate}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold">
            {formattedDate}
          </h1>
          <Link
            href={`/reservations?date=${nextDate}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            Aucune réservation pour aujourd&apos;hui
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((courtNumber) => (
              <div key={courtNumber} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Terrain {courtNumber}
                  </h2>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <dl>
                    {reservationsByCourtNumber[courtNumber]?.map((timeSlot) => (
                      <div
                        key={timeSlot.time}
                        className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                      >
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {timeSlot.time}
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                          {renderTimeSlot(courtNumber.toString(), timeSlot.time)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSlot && (
          <ReservationModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedSlot(null);
            }}
            sessionId={selectedSlot.sessionId}
            time={selectedSlot.time}
            onConfirm={handleReservationConfirm}
          />
        )}
      </div>
    </div>
  );
}

export default function Reservations() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ReservationsContent />
    </Suspense>
  );
} 