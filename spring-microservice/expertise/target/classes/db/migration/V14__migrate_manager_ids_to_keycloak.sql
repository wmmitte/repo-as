-- Migration des manager_id et traitant_id depuis auth_db vers Keycloak IDs
-- Cette migration corrige le problème où les demandes stockent l'ID auth_db
-- au lieu de l'ID Keycloak

-- 1. Mettre à jour les manager_id
-- Mapping: auth_db ID -> Keycloak ID pour manager@manager.com
UPDATE demandes_reconnaissance_competence
SET manager_id = 'f05108e5-ad0e-471c-8ab8-aeefd9b7f5f7'
WHERE manager_id = 'df34f26e-6f5b-4cbf-97f8-ae26eccf8f54';

-- 2. Mettre à jour les traitant_id si nécessaire (RH)
-- Mapping: auth_db ID -> Keycloak ID pour abdramsanou@gmail.com
-- Note: Si le traitant_id est déjà en Keycloak ID, cette requête ne fait rien
UPDATE demandes_reconnaissance_competence
SET traitant_id = 'bf220d41-7429-42f7-b2b1-79416b21d1ae'
WHERE traitant_id = 'aad2bb41-0de0-45ca-8675-73ba5c90550a';

-- 3. Ajouter d'autres mappings au besoin
-- FORMAT: UPDATE demandes_reconnaissance_competence
--         SET manager_id = '<KEYCLOAK_ID>'
--         WHERE manager_id = '<AUTH_DB_ID>';

-- Note: Pour ajouter de nouveaux mappings, exécutez une requête comme:
-- 1. Trouver l'email dans auth_db: SELECT id, email FROM utilisateurs WHERE id = '<auth_db_id>';
-- 2. Trouver le Keycloak ID: SELECT id FROM keycloak_db.user_entity WHERE email = '<email>';
-- 3. Ajouter l'UPDATE ci-dessus avec les bons IDs
