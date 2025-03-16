'use client';

import { useUpdateUserRights } from '@/app/hooks/useUpdateUserRights';

export default function UserRightsUpdater() {
  // Ce composant ne rend rien, il utilise simplement le hook pour mettre à jour les droits
  useUpdateUserRights();
  
  return null;
} 