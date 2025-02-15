'use client';

import UserMenu from '../components/UserMenu';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      {children}
    </div>
  );
} 