-- Migration V25: Suppression de la clé étrangère domaine_id de methodes_evaluation
-- Les méthodes d'évaluation sont liées aux critères d'évaluation, pas aux domaines de compétence

-- Supprimer d'abord la contrainte de clé étrangère
ALTER TABLE methodes_evaluation
DROP CONSTRAINT IF EXISTS fk_methode_domaine;

-- Supprimer l'index associé
DROP INDEX IF EXISTS idx_methodes_domaine;

-- Supprimer la colonne domaine_id
ALTER TABLE methodes_evaluation
DROP COLUMN IF EXISTS domaine_id;

-- Supprimer la contrainte d'unicité qui utilisait domaine_id
ALTER TABLE methodes_evaluation
DROP CONSTRAINT IF EXISTS uk_methode_domaine_code;

-- Ajouter une nouvelle contrainte d'unicité sur le code uniquement
ALTER TABLE methodes_evaluation
ADD CONSTRAINT uk_methode_code UNIQUE (code);

-- Mettre à jour le commentaire de la table
COMMENT ON TABLE methodes_evaluation IS 'Méthodes d''évaluation génériques. Elles seront associées aux critères d''évaluation via une table de liaison';
