export interface User {
  firstName: string;
  lastName: string;
}

export interface Reservation {
  id: string;
  court: number;
  time: string;
  date: string;
  available: boolean;
  users: User[];
} 