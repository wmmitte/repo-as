-- Script d'initialisation de la base de données Keycloak
-- Ce script est exécuté automatiquement au premier démarrage du conteneur PostgreSQL

-- Création de la base de données keycloak_db si elle n'existe pas
SELECT 'CREATE DATABASE keycloak_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak_db')\gexec

-- Connexion à la base keycloak_db et création du schéma si nécessaire
\c keycloak_db

-- Optionnel: Créer un utilisateur dédié pour Keycloak (si souhaité)
-- DO
-- $do$
-- BEGIN
--    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'keycloak_user') THEN
--       CREATE USER keycloak_user WITH PASSWORD 'keycloak_password';
--    END IF;
-- END
-- $do$;

-- Octroyer les privilèges nécessaires
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO postgres;

-- Message de confirmation
\echo 'Base de données keycloak_db créée et configurée avec succès!'
