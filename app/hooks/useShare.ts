'use client';

import { useCallback } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Hook personnalisé pour utiliser l'API Web Share
 * Retourne une fonction pour partager du contenu et indique si l'API est supportée
 */
export function useShare() {
  const isSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    // Filtrer les champs undefined/vides
    const shareData: ShareData = {};
    if (data.title) shareData.title = data.title;
    if (data.text) shareData.text = data.text;
    if (data.url) shareData.url = data.url;
    if (data.files && data.files.length > 0) shareData.files = data.files;

    // Vérifier qu'au moins un champ est présent (text, url ou files)
    if (!shareData.title && !shareData.text && !shareData.url && (!shareData.files || shareData.files.length === 0)) {
      console.error('Erreur : au moins un champ (title, text, url ou files) doit être fourni pour le partage');
      return false;
    }

    if (!isSupported) {
      // Fallback : copier dans le presse-papiers
      const shareText = `${shareData.title || ''}\n${shareData.text || ''}\n${shareData.url || ''}`.trim();
      try {
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
        return false;
      }
    }

    try {
      // Vérifier si on peut partager les fichiers
      if (shareData.files && shareData.files.length > 0) {
        if ('canShare' in navigator && !navigator.canShare(shareData)) {
          // Si les fichiers ne peuvent pas être partagés, essayer sans
          const shareDataWithoutFiles: ShareData = {
            title: shareData.title,
            text: shareData.text,
            url: shareData.url,
          };
          if (shareDataWithoutFiles.title || shareDataWithoutFiles.text || shareDataWithoutFiles.url) {
            await navigator.share(shareDataWithoutFiles);
            return true;
          }
          return false;
        }
      }
      
      await navigator.share(shareData);
      return true;
    } catch (err) {
      // L'utilisateur a annulé le partage ou une erreur est survenue
      if ((err as Error).name !== 'AbortError') {
        console.error('Erreur lors du partage:', err);
      }
      return false;
    }
  }, [isSupported]);

  return { share, isSupported };
}

