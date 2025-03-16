import { UserWithName, UserRight, UserRights } from '@/app/types/rights';

export const mockUsers: UserWithName[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com'
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com'
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@example.com'
  }
];

export const mockUserRights: UserRights[] = [
  {
    userId: '1',
    rights: [UserRight.ADMIN]
  },
  {
    userId: '2',
    rights: [UserRight.POWER_USER]
  }
  // User 3 has no rights
]; 