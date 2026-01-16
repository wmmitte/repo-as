-- Migration V2: Correction du type utilisateur_id dans la table competences
-- Changement de BIGINT vers VARCHAR pour correspondre au UUID du service Auth

ALTER TABLE competences 
  ALTER COLUMN utilisateur_id TYPE VARCHAR(255);

-- Mise à jour de l'index
DROP INDEX IF EXISTS idx_competences_utilisateur;
CREATE INDEX idx_competences_utilisateur ON competences(utilisateur_id);

-- Commentaire
COMMENT ON COLUMN competences.utilisateur_id IS 'ID UUID de l''utilisateur (référence vers le service auth)';
