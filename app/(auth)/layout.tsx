'use client';

import UserMenu from '../components/UserMenu';
import HomeMenu from '../components/HomeMenu';
import UserRightsUpdater from '../components/UserRightsUpdater';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <UserRightsUpdater />
      
      <div className="flex justify-between items-center absolute top-4 w-full px-4">
        <HomeMenu />
        <UserMenu />
      </div>

      {children}
    </div>
  );
} 