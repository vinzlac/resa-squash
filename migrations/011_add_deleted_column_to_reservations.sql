-- Migration: Ajouter la colonne deleted à la table reservations
-- Cette colonne permet de gérer la suppression logique des réservations
-- (quand TeamR ne supprime pas réellement le créneau)

-- Ajouter la colonne deleted (par défaut FALSE)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Mettre à jour toutes les lignes existantes pour définir deleted à FALSE
UPDATE reservations 
SET deleted = FALSE 
WHERE deleted IS NULL;

-- Créer un index pour optimiser les requêtes sur deleted
CREATE INDEX IF NOT EXISTS idx_reservations_deleted 
ON reservations(deleted);

-- Créer un index composé pour optimiser les requêtes combinées
CREATE INDEX IF NOT EXISTS idx_reservations_deleted_booking_action_user_id 
ON reservations(deleted, booking_action_user_id);

