-- Migration: Créer la table action_log pour tracer toutes les actions utilisateurs
-- Cette table permet de suivre les connexions, les réservations et les suppressions

-- Créer le type ENUM pour les actions
CREATE TYPE action_type AS ENUM (
  'CONNEXION',
  'ADD_BOOKING',
  'DELETE_BOOKING'
);

-- Créer le type ENUM pour les résultats
CREATE TYPE action_result AS ENUM (
  'SUCCESS',
  'FAILED'
);

-- Créer la table action_log
CREATE TABLE IF NOT EXISTS action_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action_type action_type NOT NULL,
  action_result action_result NOT NULL,
  action_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_action_log_user_id 
ON action_log(user_id);

CREATE INDEX IF NOT EXISTS idx_action_log_action_type 
ON action_log(action_type);

CREATE INDEX IF NOT EXISTS idx_action_log_action_result 
ON action_log(action_result);

CREATE INDEX IF NOT EXISTS idx_action_log_timestamp 
ON action_log(action_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_action_log_user_type 
ON action_log(user_id, action_type);

-- Créer un index GIN pour les recherches dans le JSON
CREATE INDEX IF NOT EXISTS idx_action_log_details 
ON action_log USING GIN (action_details);

-- Ajouter des commentaires
COMMENT ON TABLE action_log IS 'Table de logging de toutes les actions utilisateurs';
COMMENT ON COLUMN action_log.user_id IS 'ID de l''utilisateur qui a effectué l''action';
COMMENT ON COLUMN action_log.action_type IS 'Type d''action effectuée';
COMMENT ON COLUMN action_log.action_result IS 'Résultat de l''action (succès ou échec)';
COMMENT ON COLUMN action_log.action_timestamp IS 'Date et heure de l''action avec timezone';
COMMENT ON COLUMN action_log.action_details IS 'Détails de l''action au format JSON';

