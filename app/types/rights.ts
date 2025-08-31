export enum UserRight {
  ADMIN = 'admin',
  POWER_USER = 'power-user'
}

export interface UserRights {
  userId: string;
  rights: UserRight[];
}

 