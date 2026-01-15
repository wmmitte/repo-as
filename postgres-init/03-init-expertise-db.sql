-- Script d'initialisation de la base de données expertise
-- Ce script crée la base de données pour le microservice Expertise

-- Créer la base de données expertise_db si elle n'existe pas
SELECT 'CREATE DATABASE expertise_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'expertise_db')\gexec

-- Se connecter à la base expertise_db
\c expertise_db

-- Message de confirmation
SELECT 'Base de données expertise_db créée avec succès' AS message;
