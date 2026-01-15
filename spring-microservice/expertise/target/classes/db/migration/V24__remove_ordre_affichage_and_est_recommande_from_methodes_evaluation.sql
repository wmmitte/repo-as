-- Migration V24: Suppression des colonnes ordre_affichage et est_recommande de methodes_evaluation
-- Ces colonnes ne sont pas nécessaires pour les méthodes d'évaluation

-- Supprimer les colonnes ordre_affichage et est_recommande de la table methodes_evaluation
ALTER TABLE methodes_evaluation
DROP COLUMN IF EXISTS ordre_affichage,
DROP COLUMN IF EXISTS est_recommande;

-- Ajouter un commentaire sur la table pour documenter le changement
COMMENT ON TABLE methodes_evaluation IS 'Méthodes d''évaluation pour chaque domaine de compétence. La clé étrangère domaine_id référence domaines_competence(id)';
