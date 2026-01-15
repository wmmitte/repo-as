-- Migration pour supprimer la colonne experience
-- V4__Remove_Experience_Column.sql

ALTER TABLE utilisateurs DROP COLUMN IF EXISTS experience;

-- Commentaire
COMMENT ON TABLE utilisateurs IS 'Table des utilisateurs de la plateforme - Colonne experience supprimée';
