'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRights } from '@/app/hooks/useUserRights';
import { toast } from 'react-hot-toast';

interface Licensee {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  rejected: Licensee[];
}

export default function LicenseesPage() {
  const router = useRouter();
  const { isAdmin } = useUserRights();
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [rejectedLicensees, setRejectedLicensees] = useState<Licensee[]>([]);
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
      setLoading(true);
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

  const importLicensees = async () => {
    try {
      setImporting(true);
      setRejectedLicensees([]);
      
      const response = await fetch('/api/licensees/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Inclure les cookies dans la requête
      });
      
      if (response.status === 401) {
        // Si on a une erreur d'authentification, on affiche un message mais on continue
        console.warn('Problème d\'authentification détecté. Tentative d\'import en mode dégradé.');
        toast.error('Authentification limitée - Fonctionnalités réduites.');
        
        // Attendre un peu et rafraîchir la liste quand même
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchLicensees();
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result: ImportResult = await response.json();
      console.log('Résultat de l\'import:', result);
      
      // Afficher un message de succès/info
      toast.success(`Import terminé : ${result.imported} licenciés importés, ${result.skipped} ignorés.`);
      
      // Mettre à jour la liste des licenciés rejetés
      if (result.rejected.length > 0) {
        setRejectedLicensees(result.rejected);
        toast.error(`${result.rejected.length} licenciés n'ont pas pu être importés en raison de conflits.`);
      }
      
      // Rafraîchir la liste
      await fetchLicensees();
    } catch (error) {
      console.error('Erreur lors de l\'import des licenciés:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'import');
    } finally {
      setImporting(false);
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
      <div className="flex justify-between items-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-center flex-grow">Liste des licenciés</h1>
        <button
          onClick={importLicensees}
          disabled={importing}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          {importing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Import en cours...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Import depuis TeamR
            </>
          )}
        </button>
      </div>
      
      {rejectedLicensees.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-400 rounded">
          <h3 className="text-lg font-medium text-yellow-700 mb-2">Licenciés non importés en raison de conflits</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-yellow-300">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="px-4 py-2 border">Nom</th>
                  <th className="px-4 py-2 border">Prénom</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">ID</th>
                </tr>
              </thead>
              <tbody>
                {rejectedLicensees.map((licensee) => (
                  <tr key={licensee.userId} className="hover:bg-yellow-50">
                    <td className="px-4 py-2 border">{licensee.lastName}</td>
                    <td className="px-4 py-2 border">{licensee.firstName}</td>
                    <td className="px-4 py-2 border">{licensee.email}</td>
                    <td className="px-4 py-2 border">{licensee.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
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