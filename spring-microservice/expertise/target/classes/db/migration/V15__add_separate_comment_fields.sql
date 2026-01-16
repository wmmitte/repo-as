-- Migration V15: Ajouter des champs de commentaires séparés pour distinguer
-- les commentaires du Manager, du RH et les instructions d'assignation

-- Ajouter le champ pour le commentaire d'assignation du Manager (instructions au RH)
ALTER TABLE demandes_reconnaissance_competence
ADD COLUMN commentaire_manager_assignation TEXT;

-- Ajouter le champ pour le commentaire d'évaluation du RH
ALTER TABLE demandes_reconnaissance_competence
ADD COLUMN commentaire_rh_evaluation TEXT;

-- Commentaire sur les colonnes pour clarifier leur usage
COMMENT ON COLUMN demandes_reconnaissance_competence.commentaire_manager_assignation IS 'Instructions du Manager au RH lors de l''assignation (visible uniquement par le RH)';
COMMENT ON COLUMN demandes_reconnaissance_competence.commentaire_rh_evaluation IS 'Commentaire du RH lors de l''évaluation (visible par le Manager, pas par l''expert)';
COMMENT ON COLUMN demandes_reconnaissance_competence.commentaire_traitant IS 'Commentaire final du Manager lors de l''approbation/rejet ou demande de complément (visible par l''expert)';
