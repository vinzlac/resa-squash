-- Create user_rights table
CREATE TABLE IF NOT EXISTS user_rights (
  user_id VARCHAR(255) PRIMARY KEY,
  rights JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_rights_user_id ON user_rights(user_id);

-- Add comment
COMMENT ON TABLE user_rights IS 'Table storing user rights and permissions'; 