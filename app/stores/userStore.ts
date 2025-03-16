import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRight } from '@/app/types/rights';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAuthorized?: boolean;
  DOB: string;
  rights?: UserRight[];
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  hasRight: (right: UserRight) => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      hasRight: (right: UserRight) => {
        const user = get().user;
        if (!user || !user.rights) return false;
        return user.rights.includes(right);
      }
    }),
    {
      name: 'user-storage',
    }
  )
); 