-- Add clubId column to reservations table
ALTER TABLE reservations ADD COLUMN club_id VARCHAR(255);

-- Update existing records with default clubId for court 1
UPDATE reservations SET club_id = '60b754170ebdd0002094521b' WHERE club_id IS NULL;

-- Add index for performance on club_id
CREATE INDEX IF NOT EXISTS idx_reservations_club_id ON reservations(club_id);

-- Add comment
COMMENT ON COLUMN reservations.club_id IS 'Club ID associated with the reservation';
