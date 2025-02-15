'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomeMenu() {
  const pathname = usePathname();
  
  const getBreadcrumb = () => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 0) return null;
    
    const pageName = path[0];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  return (
    <div className="flex items-center space-x-2">
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

      {getBreadcrumb() && (
        <>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 dark:text-gray-300">
            {getBreadcrumb()}
          </span>
        </>
      )}
    </div>
  );
} 