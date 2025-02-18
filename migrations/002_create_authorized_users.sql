-- Create authorized_users table
CREATE TABLE IF NOT EXISTS authorized_users (
    email VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON authorized_users(email);

-- Add comment
COMMENT ON TABLE authorized_users IS 'Table storing users who are authorized to access the application by their email'; 