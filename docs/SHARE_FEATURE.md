# 📤 Fonctionnalité de Partage Mobile

## Vue d'ensemble

La fonctionnalité de partage utilise la **Web Share API** pour permettre aux utilisateurs de partager des informations de réservation depuis l'application mobile directement vers des applications tierces (WhatsApp, Messages, Email, etc.).

## Support des navigateurs

- ✅ **iOS Safari** (iOS 12.3+)
- ✅ **Android Chrome**
- ✅ **Edge Mobile**
- ❌ Desktop (fallback : copie dans le presse-papiers)

## Utilisation

### 1. Hook personnalisé `useShare`

Le hook `useShare` fournit une interface simple pour partager du contenu :

```typescript
import { useShare } from '@/app/hooks/useShare';

const { share, isSupported } = useShare();

const handleShare = async () => {
  const success = await share({
    title: 'Titre du partage',
    text: 'Texte à partager',
    url: 'https://example.com' // Optionnel
  });
};
```

### 2. Fonctions utilitaires

Des fonctions utilitaires sont disponibles dans `app/utils/shareHelpers.ts` pour formater les textes de partage :

- `generateReservationShareText()` : Génère un texte formaté pour une réservation
- `generateMultipleReservationsShareText()` : Génère un texte formaté pour plusieurs réservations
- `generateReservationShareUrl()` : Génère une URL de partage (optionnel)

### 3. Intégrations existantes

#### A. Modale QR Code (`QRCodeModal.tsx`)

Un bouton de partage est disponible dans la modale QR Code. Il partage :
- Le titre : "QR Code de réservation"
- Le texte : Texte personnalisé (si fourni via props)
- L'URL : URL de l'image QR code

**Exemple d'utilisation :**
```tsx
<QRCodeModal
  isOpen={isOpen}
  onClose={onClose}
  qrCodeUri={qrCodeUri}
  loading={loading}
  shareText="Ma réservation de squash du 22/01/2025 à 18h00"
  shareTitle="Réservation de squash"
/>
```

#### B. Modale de sélection de créneaux (`SelectedBookingModal.tsx`)

Un bouton de partage permet de partager la liste complète des créneaux sélectionnés avec leurs détails (court, date, heure, joueurs).

**Format du message partagé :**
```
🏸 Réservations de squash

📅 Nouvelle date: mercredi 22 janvier 2025

1. Court 1 - 18H00-19H00
   👥 Vincent Lacoste et Jean Dupont
   📅 (Original: 21/01/2025)

2. Court 2 - 19H00-20H00
   👥 Marie Martin
   📅 (Original: 21/01/2025)

Partagé depuis l'app Résa Squash
```

### 4. Exemple d'intégration dans une page

Pour ajouter un bouton de partage dans n'importe quel composant :

```tsx
'use client';

import { useShare } from '@/app/hooks/useShare';
import { generateReservationShareText } from '@/app/utils/shareHelpers';

export default function MyComponent() {
  const { share, isSupported } = useShare();
  
  const handleShareReservation = async () => {
    const shareText = generateReservationShareText(
      reservation,
      users,
      courtNumber,
      date
    );
    
    const success = await share({
      title: 'Ma réservation de squash',
      text: shareText,
    });
    
    if (success && !isSupported) {
      // Fallback : texte copié dans le presse-papiers
      alert('Texte copié dans le presse-papiers !');
    }
  };
  
  return (
    <button onClick={handleShareReservation}>
      {isSupported ? 'Partager' : 'Copier'}
    </button>
  );
}
```

## Comportement

### Sur mobile (iOS/Android)

1. L'utilisateur clique sur le bouton "Partager"
2. Le menu de partage natif du système s'ouvre
3. L'utilisateur choisit l'application (WhatsApp, Messages, Email, etc.)
4. Le message est pré-rempli et prêt à être envoyé
5. L'utilisateur peut sélectionner le groupe/contact et envoyer

### Sur desktop

1. L'utilisateur clique sur le bouton "Copier"
2. Le texte est copié dans le presse-papiers
3. Une notification confirme la copie

## Limitations

- **Fichiers** : L'API Web Share ne permet pas de partager des fichiers directement (uniquement texte, URL, titre)
- **Contrôle limité** : Vous ne pouvez pas contrôler directement quelle application s'ouvre, c'est l'utilisateur qui choisit
- **Desktop** : Pas de support natif, utilisation du presse-papiers en fallback

## Bonnes pratiques

1. **Toujours vérifier le support** : Utiliser `isSupported` pour adapter l'interface
2. **Fournir un fallback** : Sur desktop, utiliser la copie dans le presse-papiers
3. **Messages clairs** : Formater les textes de partage de manière lisible
4. **Feedback utilisateur** : Informer l'utilisateur quand le partage a réussi ou échoué

## Tests

Pour tester la fonctionnalité :

1. **Sur iOS** : Ouvrir l'app dans Safari iOS et tester le partage
2. **Sur Android** : Ouvrir l'app dans Chrome Android et tester le partage
3. **Sur desktop** : Vérifier que le fallback (copie) fonctionne correctement

## Ressources

- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Can I Use - Web Share API](https://caniuse.com/web-share-api)

