"use client";

import { useState, useEffect } from 'react';
import UserMenu from './components/UserMenu';
import HomeContent from './components/HomeContent';

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <header>
          <h1 className="text-3xl font-bold">Club de Squash</h1>
        </header>

        <HomeContent />
      </div>
    </div>
  );
}
