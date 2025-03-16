'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function HomeMenu() {
  const pathname = usePathname() || '';
  
  const getBreadcrumb = () => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 0) return null;
    
    return path.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + path.slice(0, index + 1).join('/'),
      isLast: index === path.length - 1
    }));
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <div className="flex items-center space-x-4">
      <Menu as="div" className="relative z-50">
        <Menu.Button className="flex items-center justify-center w-8 h-8 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none">
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
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
          <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/reservations"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    Réservations
                  </Link>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <Menu as="div" className="relative w-full">
                    <Menu.Button
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <span>Admin</span>
                      <svg 
                        className="ml-2 h-4 w-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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
                      <Menu.Items className="absolute left-full top-0 ml-1 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/admin/access"
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                Gestion des accès
                              </Link>
                            )}
                          </Menu.Item>
                          
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/admin/rights"
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                Gestion des droits
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <Link
        href="/"
        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>

      {breadcrumbs && breadcrumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          <span className="text-gray-400">/</span>
          {crumb.isLast ? (
            <span className="text-gray-700 dark:text-gray-300">
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.path}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
} 