'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRights } from '@/app/hooks/useUserRights';

interface Licensee {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function LicenseesPage() {
  const router = useRouter();
  const { isAdmin } = useUserRights();
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const dataFetchedRef = useRef(false);

  // Marquer que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effet pour vérifier les droits et charger les données
  useEffect(() => {
    if (!isClient) return;

    console.log('isAdmin():', isAdmin());

    // Si nous ne sommes pas admin, rediriger
    if (!isAdmin()) {
      console.log('Utilisateur non admin, redirection');
      router.push('/unauthorized');
      return;
    }

    // Éviter les appels répétés à l'API
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    // Récupérer les licenciés
    fetchLicensees();
  }, [isClient, isAdmin, router]);

  const fetchLicensees = async () => {
    try {
      console.log('Récupération des licenciés...');
      const response = await fetch('/api/licensees');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Licenciés récupérés:', data);
      setLicensees(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des licenciés:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || loading) {
    return <div className="p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8 mt-4 text-center">Liste des licenciés</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Prénom</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">ID</th>
            </tr>
          </thead>
          <tbody>
            {licensees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center">Aucun licencié trouvé</td>
              </tr>
            ) : (
              licensees.map((licensee) => (
                <tr key={licensee.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{licensee.lastName}</td>
                  <td className="px-4 py-2 border">{licensee.firstName}</td>
                  <td className="px-4 py-2 border">{licensee.email}</td>
                  <td className="px-4 py-2 border">{licensee.userId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 