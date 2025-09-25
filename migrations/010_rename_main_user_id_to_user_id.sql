-- Rename main_user_id column to user_id in reservations table
-- This makes the column name more intuitive as it represents the main player of the reservation

-- Rename the column
ALTER TABLE reservations RENAME COLUMN main_user_id TO user_id;

-- Update the index name to match the new column name
DROP INDEX IF EXISTS idx_reservations_main_user_id;
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);

-- Update the comment to reflect the new column name
COMMENT ON COLUMN reservations.user_id IS 'ID of the main user/player for the reservation';
