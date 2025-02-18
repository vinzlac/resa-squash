'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface ConnectedUser {
  userId: string;
}

export function useConnectedUser(): ConnectedUser | null {
  const [user, setUser] = useState<ConnectedUser | null>(null);

  useEffect(() => {
    const userId = Cookies.get('teamr_userId');
    setUser(userId ? { userId } : null);
  }, []);

  return user;
} 