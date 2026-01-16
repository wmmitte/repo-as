-- Migration V23: Suppression de la colonne ordre_affichage de criteres_evaluation
-- Cette colonne n'est pas nécessaire pour les critères d'évaluation

-- Supprimer la colonne ordre_affichage de la table criteres_evaluation
ALTER TABLE criteres_evaluation
DROP COLUMN IF EXISTS ordre_affichage;

-- Ajouter un commentaire sur la table pour documenter le changement
COMMENT ON TABLE criteres_evaluation IS 'Critères d''évaluation spécifiques à chaque domaine de compétence. La clé étrangère domaine_id référence domaines_competence(id)';
