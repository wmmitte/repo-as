-- Script d'initialisation de la base de données pour le service Accueil
-- Ce script sera exécuté automatiquement par PostgreSQL au démarrage

-- Créer la base de données acceuil_db si elle n'existe pas
SELECT 'CREATE DATABASE acceuil_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'acceuil_db')\gexec

-- Se connecter à la base acceuil_db
\c acceuil_db

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données acceuil_db créée ou déjà existante';
END $$;

-- Note: Le service Accueil est actuellement un service SANS ÉTAT
-- Il agrège les données des services Auth et Expertise sans les stocker
-- La base de données est créée pour une utilisation future (cache, analytics, etc.)
-- 
-- Tables futures possibles:
--   - analyse_comportementale (analytics utilisateur)
--   - analyse_contextuelle (contexte de navigation)
--   - analyse_technologique (détection technologie)
--   - cache_experts (cache temporaire pour performance)
