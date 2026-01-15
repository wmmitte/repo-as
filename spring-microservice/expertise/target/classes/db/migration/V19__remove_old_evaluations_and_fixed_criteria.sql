-- Migration V19: Suppression des anciennes évaluations et des critères fixes
-- Cette migration nettoie les évaluations basées sur les critères fixes historiques
-- et prépare le système pour utiliser uniquement les critères dynamiques par domaine de compétence

-- 1. Remettre les demandes évaluées dans l'état ASSIGNEE_RH (avant évaluation)
UPDATE demandes_reconnaissance_competence
SET statut = 'ASSIGNEE_RH',
    date_evaluation = NULL
WHERE id IN (SELECT demande_id FROM evaluations_competence);

-- 2. Supprimer toutes les évaluations existantes
DELETE FROM evaluations_competence;

-- 3. Supprimer les contraintes CHECK sur les colonnes de critères fixes
ALTER TABLE evaluations_competence DROP CONSTRAINT IF EXISTS chk_note_experience;
ALTER TABLE evaluations_competence DROP CONSTRAINT IF EXISTS chk_note_formation;
ALTER TABLE evaluations_competence DROP CONSTRAINT IF EXISTS chk_note_projets;
ALTER TABLE evaluations_competence DROP CONSTRAINT IF EXISTS chk_note_competence_technique;

-- 4. Supprimer les colonnes des critères fixes
ALTER TABLE evaluations_competence DROP COLUMN IF EXISTS note_experience;
ALTER TABLE evaluations_competence DROP COLUMN IF EXISTS note_formation;
ALTER TABLE evaluations_competence DROP COLUMN IF EXISTS note_projets;
ALTER TABLE evaluations_competence DROP COLUMN IF EXISTS note_competence_technique;

-- Commentaire sur la migration
COMMENT ON TABLE evaluations_competence IS 'Table des évaluations de compétences - Critères dynamiques basés sur les domaines de compétence';
