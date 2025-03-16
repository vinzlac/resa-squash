'use client';

import { useUserStore } from '@/app/stores/userStore';
import { UserRight } from '@/app/types/rights';

export function useUserRights() {
  const { user, hasRight } = useUserStore();
  
  const isAdmin = (): boolean => {
    return hasRight(UserRight.ADMIN);
  };
  
  const isPowerUser = (): boolean => {
    return hasRight(UserRight.POWER_USER);
  };
  
  const hasAnyRight = (): boolean => {
    return user?.rights !== undefined && user.rights.length > 0;
  };
  
  return {
    rights: user?.rights || [],
    hasRight,
    isAdmin,
    isPowerUser,
    hasAnyRight
  };
} 