-- Création de la base de données pour le service Paiement
CREATE DATABASE paiement_db;

-- Se connecter à la base de données
\c paiement_db;

-- Créer le schéma public si nécessaire
CREATE SCHEMA IF NOT EXISTS public;

-- Accorder les permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON DATABASE paiement_db TO postgres;
