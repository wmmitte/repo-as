-- Migration V28: Ajout du système de scoring pour les experts
-- Le score global permet de classer les experts par pertinence

-- Ajout de la colonne score_global
ALTER TABLE expertises ADD COLUMN IF NOT EXISTS score_global DECIMAL(10, 2) DEFAULT 0;

-- Ajout d'une colonne JSON pour stocker le détail des scores (pour debug/transparence)
ALTER TABLE expertises ADD COLUMN IF NOT EXISTS score_details JSONB DEFAULT '{}';

-- Ajout de la date de dernier calcul du score
ALTER TABLE expertises ADD COLUMN IF NOT EXISTS date_calcul_score TIMESTAMP;

-- Index pour optimiser le tri par score
CREATE INDEX IF NOT EXISTS idx_expertises_score_global ON expertises(score_global DESC);

-- Index composite pour les recherches triées par score
CREATE INDEX IF NOT EXISTS idx_expertises_publiee_score ON expertises(publiee, score_global DESC) WHERE publiee = true;

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN expertises.score_global IS 'Score global de l''expert (0-100), calculé automatiquement';
COMMENT ON COLUMN expertises.score_details IS 'Détail du calcul du score en JSON (certification, experience, profil, popularite, activite)';
COMMENT ON COLUMN expertises.date_calcul_score IS 'Date du dernier calcul du score';
