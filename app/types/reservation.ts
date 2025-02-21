export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Reservation {
  id: string;
  court: number;
  time: string;
  endTime: string;
  date: string;
  participants: number;
  available: boolean;
  users: User[];
} 