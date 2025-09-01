-- Add vinzlac@gmail.com to authorized_users table
INSERT INTO authorized_users (email) 
VALUES ('vinzlac@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE authorized_users IS 'Table storing users who are authorized to access the application by their email';
