export interface Booking {
  bookingId: string;
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
  bookingActionUserId: string;
}

export interface BookingWithoutId {
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
  bookingActionUserId: string;
  createdAt: string;
}

export interface MergeBooking {
  bookingId?: string; // Optionnel car peut venir de Booking
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
  bookingActionUserId: string;
  createdAt?: string; // Optionnel car peut venir de BookingWithoutId
}
