'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Reservation, User } from '@/app/types/reservation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, addDays, subDays, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationModal from '@/app/components/ReservationModal';
import { useConnectedUser } from '@/app/hooks/useConnectedUser';
import DeleteReservationModal from '@/app/components/DeleteReservationModal';
import { useUserRights } from '@/app/hooks/useUserRights';
import QRCodeModal from '@/app/components/QRCodeModal';

interface ReservationByTimeSlot {
  time: string;
  users: User[];
  sessionId: string;
}

function ReservationsContent() {
  const user = useConnectedUser();
  const userId = user?.userId;
  const { isPowerUser } = useUserRights();
  const hasPowerUserRights = isPowerUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams() || new URLSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Formatage de la date
  const formattedDate = date ? format(new Date(date), "EEEE d MMMM yyyy", { locale: fr }) : '';

  const previousDate = format(subDays(new Date(date), 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(new Date(date), 1), 'yyyy-MM-dd');
  const previousWeekDate = format(subDays(new Date(date), 7), 'yyyy-MM-dd');
  const nextWeekDate = format(addDays(new Date(date), 7), 'yyyy-MM-dd');

  const isDatePassed = isBefore(startOfDay(new Date(date)), startOfDay(new Date()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ sessionId: string; time: string } | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<{ 
    sessionId: string; 
    time: string; 
    partnerId: string;
    mainUserId: string;
  } | null>(null);

  const handleDeleteClick = (sessionId: string, time: string, partnerId: string, mainUserId: string) => {
    setSlotToDelete({ sessionId, time, partnerId, mainUserId });
    setIsDeleteModalOpen(true);
  };

  const handleQRCodeClick = async (sessionId: string, userId: string) => {
    console.log('🔍 Ouverture du QR code pour sessionId:', sessionId, 'userId:', userId);
    
    setIsQRModalOpen(true);
    setQrCodeLoading(true);
    setQrCodeUri(null);

    try {
      const response = await fetch(`/api/bookings/qr-code?sessionId=${sessionId}&userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du QR code');
      }

      const data = await response.json();
      
      if (data.qrCodeUri) {
        setQrCodeUri(data.qrCodeUri);
      } else {
        console.error('❌ Pas de qrCodeUri dans la réponse:', data);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du QR code:', error);
    } finally {
      setQrCodeLoading(false);
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
              <div className="group relative">
                <span className="text-green-600 dark:text-green-400 cursor-help">
                  Disponible
                </span>
                <div className="absolute left-0 top-0 mt-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-pre">
                    {JSON.stringify({
                      sessionId: timeSlot.sessionId
                    }, null, 2)}
                  </div>
                  <div className="w-3 h-3 left-3 -top-1 absolute transform rotate-45 bg-black"></div>
                </div>
              </div>
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
            <div className="flex justify-between items-center">
              <div className="group relative">
                <span className="text-gray-900 dark:text-white cursor-help">
                  {timeSlot.users.map(user => `${user.firstName} ${user.lastName}`).join(', ')}
                </span>
                <div className="absolute left-0 top-0 mt-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-pre">
                    {JSON.stringify({
                      sessionId: timeSlot.sessionId,
                      userId: timeSlot.users[0]?.id,
                      partnerId: timeSlot.users[1]?.id
                    }, null, 2)}
                  </div>
                  <div className="w-3 h-3 left-3 -top-1 absolute transform rotate-45 bg-black"></div>
                </div>
              </div>
              <div className="flex ml-2">
                {/* Bouton QR Code - Affiché seulement si l'utilisateur connecté a pris la réservation */}
                {timeSlot.users[0]?.id === userId && (
                  <button
                    onClick={() => handleQRCodeClick(timeSlot.sessionId, userId)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                    title="Afficher le QR code"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 8h4m-4 8h4m8-8h4M4 4h4m8 0h4M8 20h4m-4-8h4m8 0h4" />
                    </svg>
                  </button>
                )}
                
                {/* Bouton Suppression - Affiché si l'utilisateur a pris la réservation OU s'il a les droits admin */}
                {(timeSlot.users[0]?.id === userId || hasPowerUserRights) && (
                  <button
                    onClick={() => {
                      // Déterminer le mainUserId (toujours le premier utilisateur)
                      const mainUserId = timeSlot.users[0]?.id || '';
                      
                      // Déterminer le partnerId (toujours le deuxième utilisateur)
                      const partnerId = timeSlot.users[1]?.id || '';
                      
                      handleDeleteClick(
                        timeSlot.sessionId,
                        timeSlot.time,
                        partnerId,
                        mainUserId
                      );
                    }}
                    className="text-red-500 hover:text-red-700"
                    title={hasPowerUserRights && timeSlot.users[0]?.id !== userId ? 
                      "Supprimer (droit administrateur)" : "Supprimer"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
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
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href={`/reservations?date=${previousWeekDate}`}
              className="text-blue-600 hover:text-blue-800 mr-2"
              title="Semaine précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Link>
            <Link
              href={`/reservations?date=${previousDate}`}
              className="text-blue-600 hover:text-blue-800"
              title="Jour précédent"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">
            {formattedDate}
          </h1>
          <div className="flex items-center">
            <Link
              href={`/reservations?date=${nextDate}`}
              className="text-blue-600 hover:text-blue-800"
              title="Jour suivant"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={`/reservations?date=${nextWeekDate}`}
              className="text-blue-600 hover:text-blue-800 ml-2"
              title="Semaine suivante"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
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
            date={date}
            timeSlot={reservationsByCourtNumber[parseInt(selectedSlot.sessionId.split('-')[0])]?.find(
              slot => slot.time === selectedSlot.time
            ) || { users: [] }}
            onSuccess={fetchReservations}
          />
        )}

        {slotToDelete && (
          <DeleteReservationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSlotToDelete(null);
            }}
            sessionId={slotToDelete.sessionId}
            partnerId={slotToDelete.partnerId}
            mainUserId={slotToDelete.mainUserId}
            onSuccess={fetchReservations}
            time={slotToDelete.time}
            date={date}
            startDate={new Date(date + 'T' + slotToDelete.time.replace('H', ':') + ':00')}
          />
        )}

        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false);
            setQrCodeUri(null);
          }}
          qrCodeUri={qrCodeUri}
          loading={qrCodeLoading}
        />
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