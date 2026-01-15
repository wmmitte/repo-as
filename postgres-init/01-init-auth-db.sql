-- Script d'initialisation de la base de données pour le service Auth
-- Ce script sera exécuté automatiquement par PostgreSQL au démarrage

-- Créer la base de données auth_db si elle n'existe pas
SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données auth_db créée ou déjà existante';
END $$;
