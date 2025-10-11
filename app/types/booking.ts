// Interface commune avec les champs partagés par tous les types de réservations
export interface CommonBooking {
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
  bookingActionUserId: string;
}

export interface Booking extends CommonBooking {
  bookingId: string;
}

export interface BookingWithoutId extends CommonBooking {
  createdAt: string;
  deleted: boolean;
}

export interface MergeBooking extends CommonBooking {
  bookingId?: string; // Optionnel car peut venir de Booking
  createdAt?: string; // Optionnel car peut venir de BookingWithoutId
}
