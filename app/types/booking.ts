export interface Booking {
  bookingId: string;
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
}

export interface BookingWithoutId {
  sessionId: string;
  userId: string;
  partnerId: string;
  startDate: string;
  clubId: string;
}
