'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../stores/userStore';

export default function UserMenu() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span>{user?.firstName} {user?.lastName}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/profile')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                >
                  Profil
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/settings')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                >
                  Paramètres
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                >
                  Déconnexion
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 