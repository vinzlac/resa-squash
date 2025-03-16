export enum UserRight {
  ADMIN = 'admin',
  POWER_USER = 'power-user'
}

export interface UserRights {
  userId: string;
  rights: UserRight[];
}

export interface UserWithName {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
} 