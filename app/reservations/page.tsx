'use client';

import { useState, useEffect, Suspense } from 'react';
import { Reservation } from '@/app/types/reservation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReservationByTimeSlot {
  time: string;
  participants: string[];
}

function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Formatage de la date
  const formattedDate = date ? format(new Date(date), "EEEE d MMMM yyyy", { locale: fr }) : '';

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`/api/reservations?date=${date}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des réservations');
        }
        
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [date]);

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
      if (!reservation.available && reservation.user) {
        existingTimeSlot.participants.push(reservation.user);
      }
    } else {
      reservationsByCourtNumber[reservation.court].push({
        time: reservation.time,
        participants: reservation.available ? ['Disponible'] : reservation.user ? [reservation.user] : [],
      });
    }
  });

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Link>

        <h1 className="text-3xl font-bold mb-8">
          Réservations pour la date du {formattedDate}
        </h1>

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
                          {timeSlot.participants[0] === 'Disponible' ? (
                            <span className="text-green-600 dark:text-green-400">Disponible</span>
                          ) : (
                            <span className="text-gray-900 dark:text-white">
                              {timeSlot.participants.join(', ')}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ))}
          </div>
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