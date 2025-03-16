'use client';

import { useUserStore } from '@/app/stores/userStore';
import { UserRight } from '@/app/types/rights';
import { useEffect, useState } from 'react';

export function useUserRights() {
  const { user, hasRight } = useUserStore();
  const [isClient, setIsClient] = useState(false);
  
  // S'assurer que le hook fonctionne correctement côté client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isAdmin = (): boolean => {
    if (!isClient) return false;
    return hasRight(UserRight.ADMIN);
  };
  
  const isPowerUser = (): boolean => {
    if (!isClient) return false;
    return hasRight(UserRight.POWER_USER);
  };
  
  const hasAnyRight = (): boolean => {
    if (!isClient) return false;
    return user?.rights !== undefined && user.rights.length > 0;
  };
  
  return {
    rights: isClient ? (user?.rights || []) : [],
    hasRight,
    isAdmin,
    isPowerUser,
    hasAnyRight
  };
} 