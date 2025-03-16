
-- Ajouter les droits admin et power-user à l'utilisateur spécifié
INSERT INTO user_rights (user_id, rights)
VALUES ('60bf2fdd1fd8d20020d2c8a7', '["admin", "power-user"]'::jsonb)
ON CONFLICT (user_id) 
DO UPDATE SET rights = '["admin", "power-user"]'::jsonb, updated_at = CURRENT_TIMESTAMP; 