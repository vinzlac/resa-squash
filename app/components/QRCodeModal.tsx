'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useShare } from '@/app/hooks/useShare';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUri: string | null;
  loading: boolean;
  shareText?: string; // Texte optionnel à partager
  shareTitle?: string; // Titre optionnel à partager
  time?: string; // Heure du créneau
  court?: number; // Numéro du court
  date?: string; // Date du créneau
}

export default function QRCodeModal({ isOpen, onClose, qrCodeUri, loading, shareText, shareTitle, time, court, date }: QRCodeModalProps) {
  const { share, isSupported } = useShare();

  const handleShare = async () => {
    try {
      // Construire le texte de partage avec la date, l'heure et le court
      let shareTextContent = '';
      if (court && time) {
        let datePart = '';
        if (date) {
          try {
            const formattedDate = format(new Date(date), "dd/MM/yyyy", { locale: fr });
            datePart = `${formattedDate} - `;
          } catch (err) {
            console.error('Erreur lors du formatage de la date:', err);
          }
        }
        shareTextContent = `${datePart}Court ${court} - ${time}`;
      } else if (shareText) {
        shareTextContent = shareText;
      } else {
        shareTextContent = 'QR Code de ma réservation de squash';
      }

      // Construire les données de partage
      const shareData: { title?: string; text?: string; url?: string; files?: File[] } = {
        text: shareTextContent,
      };
      
      if (shareTitle) {
        shareData.title = shareTitle;
      }

      // Si on a une URL de QR code et que l'API supporte le partage de fichiers
      if (qrCodeUri && isSupported) {
        try {
          // Télécharger l'image depuis l'URL
          const response = await fetch(qrCodeUri);
          const blob = await response.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          
          // Vérifier si navigator.share supporte les fichiers
          if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          } else {
            // Si les fichiers ne sont pas supportés, utiliser l'URL
            shareData.url = qrCodeUri;
          }
        } catch (err) {
          console.error('Erreur lors du téléchargement de l\'image:', err);
          // En cas d'erreur, utiliser juste l'URL
          shareData.url = qrCodeUri;
        }
      } else if (qrCodeUri) {
        // Si l'API n'est pas supportée ou si on ne peut pas télécharger l'image
        shareData.url = qrCodeUri;
      }

      const success = await share(shareData);
      if (success && !isSupported) {
        // Si on a utilisé le fallback (copie dans le presse-papiers)
        alert('Texte copié dans le presse-papiers !');
      } else if (!success) {
        // Afficher une erreur si le partage a échoué
        alert('Impossible de partager le QR code. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      alert('Erreur lors du partage. Veuillez réessayer.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  QR Code de la réservation
                </Dialog.Title>
                
                <div className="flex flex-col items-center space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Chargement du QR code...</p>
                    </div>
                  ) : qrCodeUri ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Image 
                        src={qrCodeUri} 
                        alt="QR Code de la réservation"
                        width={256}
                        height={256}
                        className="object-contain border border-gray-200 dark:border-gray-600 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Scannez ce QR code pour accéder aux détails de votre réservation
                      </p>
                      
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400">Erreur lors du chargement du QR code</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  {/* Bouton de partage - seulement si l'API est supportée ou si on a du texte à partager */}
                  {(isSupported || shareText) && (
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-100 dark:bg-green-900 px-4 py-2 text-sm font-medium text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      title={isSupported ? 'Partager' : 'Copier dans le presse-papiers'}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {isSupported ? 'Partager' : 'Copier'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
