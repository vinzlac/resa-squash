-- Rename user_id column to booking_action_user_id in reservations table
-- This makes the column name more descriptive of its purpose

-- Rename the column
ALTER TABLE reservations RENAME COLUMN user_id TO booking_action_user_id;

-- Update the index name to match the new column name
DROP INDEX IF EXISTS idx_reservations_user_id;
CREATE INDEX IF NOT EXISTS idx_reservations_booking_action_user_id ON reservations(booking_action_user_id);

-- Update the comment to reflect the new column name
COMMENT ON COLUMN reservations.booking_action_user_id IS 'ID of the user who performed the booking action (created the reservation)';
