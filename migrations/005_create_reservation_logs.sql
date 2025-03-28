-- Create table for reservations
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  main_user_id VARCHAR(255) NOT NULL,
  partner_id VARCHAR(255) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance on reservations
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_session_id ON reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_reservations_main_user_id ON reservations(main_user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_partner_id ON reservations(partner_id);
CREATE INDEX IF NOT EXISTS idx_reservations_start_date ON reservations(start_date);

-- Add comments
COMMENT ON TABLE reservations IS 'Table storing logs of reservation actions'; 