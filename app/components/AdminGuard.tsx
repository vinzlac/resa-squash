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

  useEffect(() => {
    // Vérifier si l'utilisateur a les droits d'administration
    if (!isAdmin()) {
      router.push('/unauthorized');
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 