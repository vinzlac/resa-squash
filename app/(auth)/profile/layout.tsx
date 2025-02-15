'use client';

import UserMenu from '../../components/UserMenu';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>
      {children}
    </div>
  );
} 