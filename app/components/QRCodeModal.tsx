'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUri: string | null;
  loading: boolean;
}

export default function QRCodeModal({ isOpen, onClose, qrCodeUri, loading }: QRCodeModalProps) {
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
                    <div className="flex flex-col items-center space-y-2">
                      <img 
                        src={qrCodeUri} 
                        alt="QR Code de la réservation"
                        className="w-64 h-64 object-contain border border-gray-200 dark:border-gray-600 rounded-lg"
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

                <div className="mt-6 flex justify-end">
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
