'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRights } from '../hooks/useUserRights';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isAdmin } = useUserRights();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    
    // Attendre un court instant pour s'assurer que les droits sont chargés
    const timer = setTimeout(() => {
      // Vérifier si l'utilisateur a les droits d'administration
      if (isClient && !isAdmin()) {
        router.push('/unauthorized');
      } else if (isClient) {
        setIsLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAdmin, router, isClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 