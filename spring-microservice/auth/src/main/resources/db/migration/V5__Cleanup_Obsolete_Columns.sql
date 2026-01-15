-- Migration pour nettoyer les colonnes obsolètes de la table utilisateurs
-- V5__Cleanup_Obsolete_Columns.sql
-- Ces colonnes ont été déplacées vers d'autres tables/bases de données

-- Suppression des colonnes liées aux certifications
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS certification;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS certifications;

-- Suppression des colonnes d'adresse
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS code_postal;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS ville;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS pays;

-- Suppression des colonnes professionnelles
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS disponibilite;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS poste_actuel;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS secteur_activite;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS tarif_horaire;

-- Suppression des colonnes entreprise
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS est_entreprise;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS nom_entreprise;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS taille_entreprise;
ALTER TABLE utilisateurs DROP COLUMN IF EXISTS site_web_entreprise;

-- Commentaire
COMMENT ON TABLE utilisateurs IS 'Table des utilisateurs de la plateforme - Nettoyage des colonnes obsolètes effectué';
