'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/app/stores/userStore';

export function useUpdateUserRights() {
  const { user, setUser } = useUserStore();
  const updatingRef = useRef(false);

  useEffect(() => {
    const updateUserRights = async () => {
      // Si l'utilisateur n'est pas connecté ou si une mise à jour est déjà en cours, ne rien faire
      if (!user || !user.id || updatingRef.current) return;
      
      // Marquer qu'une mise à jour est en cours pour éviter les boucles infinies
      updatingRef.current = true;

      try {
        // Appel à l'API pour récupérer les droits de l'utilisateur
        const response = await fetch(`/api/admin/user-rights?userId=${user.id}`);
        
        if (!response.ok) {
          console.error('Erreur lors de la récupération des droits utilisateur');
          return;
        }
        
        const data = await response.json();
        
        // Ne mettre à jour que si les droits ont changé
        const currentRights = user.rights || [];
        const newRights = data.rights || [];
        
        // Vérifier si les droits ont changé
        const rightsChanged = 
          currentRights.length !== newRights.length || 
          currentRights.some((right, index) => right !== newRights[index]);
        
        if (rightsChanged) {
          // Mettre à jour le contexte utilisateur avec les droits récupérés
          setUser({
            ...user,
            rights: data.rights
          });
          
          console.log('Droits utilisateur mis à jour:', data.rights);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des droits utilisateur:', error);
      } finally {
        // Réinitialiser le flag de mise à jour
        updatingRef.current = false;
      }
    };

    updateUserRights();
    
    // Mettre en place un intervalle pour rafraîchir périodiquement les droits
    const intervalId = setInterval(updateUserRights, 60000); // Rafraîchir toutes les minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, setUser, user]);

  return null;
} 