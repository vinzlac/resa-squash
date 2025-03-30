'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
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
  updated: number;
  skipped: number;
  rejected: Licensee[];
}

export default function LicenseesPage() {
  const router = useRouter();
  const { isAdmin } = useUserRights();
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [rejectedLicensees, setRejectedLicensees] = useState<Licensee[]>([]);
  const dataFetchedRef = useRef(false);

  // Filtres
  const [nameFilter, setNameFilter] = useState('');
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  // Tri
  const [sortField, setSortField] = useState<'lastName' | 'firstName' | 'email' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
      const response = await fetch('/api/admin/licensees');
      
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
      
      const response = await fetch('/api/admin/licensees/import', {
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
      toast.success(`Import terminé : ${result.imported} licenciés importés, ${result.updated} mis à jour, ${result.skipped} ignorés.`);
      
      // Mettre à jour la liste des licenciés rejetés
      if (result.rejected.length > 0) {
        setRejectedLicensees(result.rejected);
        toast.error(`${result.rejected.length} licenciés n'ont pas pu être importés en raison d'erreurs.`);
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

  const deleteAllLicensees = async () => {
    // Demander confirmation
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les licenciés ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setDeleting(true);
      
      const response = await fetch('/api/admin/licensees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Résultat de la suppression:', data);
      
      toast.success(`${data.deleted} licenciés ont été supprimés.`);
      
      // Rafraîchir la liste
      await fetchLicensees();
    } catch (error) {
      console.error('Erreur lors de la suppression des licenciés:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour changer le tri
  const handleSort = (field: 'lastName' | 'firstName' | 'email') => {
    if (sortField === field) {
      // Si même colonne, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si nouvelle colonne, définir sur ascendant
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrer et trier les licenciés selon les critères
  const filteredAndSortedLicensees = useMemo(() => {
    // D'abord filtrer
    const filtered = licensees.filter(licensee => {
      const nameMatches = licensee.lastName.toLowerCase().includes(nameFilter.toLowerCase());
      const firstNameMatches = licensee.firstName.toLowerCase().includes(firstNameFilter.toLowerCase());
      const emailMatches = licensee.email.toLowerCase().includes(emailFilter.toLowerCase());
      
      return nameMatches && firstNameMatches && emailMatches;
    });

    // Ensuite trier si un champ de tri est sélectionné
    if (sortField) {
      return [...filtered].sort((a, b) => {
        // Comparaison insensible à la casse
        const valueA = a[sortField].toLowerCase();
        const valueB = b[sortField].toLowerCase();
        
        if (valueA < valueB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [licensees, nameFilter, firstNameFilter, emailFilter, sortField, sortDirection]);
  
  const resetFilters = () => {
    setNameFilter('');
    setFirstNameFilter('');
    setEmailFilter('');
  };

  // Composant pour afficher les flèches de tri
  const SortArrow = ({ field }: { field: 'lastName' | 'firstName' | 'email' }) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    
    return sortDirection === 'asc' ? (
      <span className="ml-1 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </span>
    ) : (
      <span className="ml-1 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    );
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
        <div className="flex space-x-2">
          <button
            onClick={deleteAllLicensees}
            disabled={deleting || importing}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            {deleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Supprimer tout
              </>
            )}
          </button>
          <button
            onClick={importLicensees}
            disabled={importing || deleting}
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
      
      {/* Filtres */}
      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="text-lg font-medium mb-2">Filtres</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              id="nameFilter"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filtrer par nom..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="firstNameFilter" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              id="firstNameFilter"
              type="text"
              value={firstNameFilter}
              onChange={(e) => setFirstNameFilter(e.target.value)}
              placeholder="Filtrer par prénom..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="emailFilter" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="emailFilter"
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Filtrer par email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="self-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {filteredAndSortedLicensees.length} licenciés affichés sur {licensees.length} au total
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="px-4 py-2 border cursor-pointer" 
                onClick={() => handleSort('lastName')}
              >
                Nom <SortArrow field="lastName" />
              </th>
              <th 
                className="px-4 py-2 border cursor-pointer" 
                onClick={() => handleSort('firstName')}
              >
                Prénom <SortArrow field="firstName" />
              </th>
              <th 
                className="px-4 py-2 border cursor-pointer" 
                onClick={() => handleSort('email')}
              >
                Email <SortArrow field="email" />
              </th>
              <th className="px-4 py-2 border">ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLicensees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center">Aucun licencié trouvé</td>
              </tr>
            ) : (
              filteredAndSortedLicensees.map((licensee) => (
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