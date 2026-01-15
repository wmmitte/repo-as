-- Migration pour nettoyer les colonnes supplémentaires obsolètes
-- V6__Cleanup_Additional_Columns.sql

-- Suppression des colonnes d'adresse supplémentaires
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS adresse;

-- Suppression des colonnes professionnelles supplémentaires
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS bio;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS profession;

-- Suppression de la colonne entreprise
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS entreprise;

-- Commentaire
COMMENT ON TABLE utilisateurs IS 'Table des utilisateurs de la plateforme - Nettoyage supplémentaire des colonnes obsolètes effectué';
