-- Migration V8: Ajouter le champ keycloak_id à la table utilisateurs
-- Ce champ stocke l'ID Keycloak (subject du token OIDC) pour permettre
-- la recherche d'utilisateurs par leur ID Keycloak

ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS keycloak_id VARCHAR(255) UNIQUE;

-- Index pour optimiser les recherches par keycloak_id
CREATE INDEX IF NOT EXISTS idx_utilisateurs_keycloak_id ON utilisateurs(keycloak_id);

-- Migration des données existantes : copier les IDs OAuth vers keycloak_id
-- Le keycloakId est le même que le providerId stocké dans google_id/facebook_id/apple_id
UPDATE utilisateurs SET keycloak_id = google_id WHERE keycloak_id IS NULL AND google_id IS NOT NULL;
UPDATE utilisateurs SET keycloak_id = facebook_id WHERE keycloak_id IS NULL AND facebook_id IS NOT NULL;
UPDATE utilisateurs SET keycloak_id = apple_id WHERE keycloak_id IS NULL AND apple_id IS NOT NULL;
