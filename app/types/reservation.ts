export interface Reservation {
  id: number;
  court: number;
  time: string;
  users: string[];
  date: string;
  available: boolean;
} 