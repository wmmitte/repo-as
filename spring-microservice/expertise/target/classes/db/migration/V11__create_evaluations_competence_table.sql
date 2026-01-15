-- Migration pour créer la table des évaluations de compétence

CREATE TABLE IF NOT EXISTS evaluations_competence (
    id BIGSERIAL PRIMARY KEY,
    demande_id BIGINT NOT NULL,
    traitant_id VARCHAR(255) NOT NULL,
    note_globale INTEGER,
    criteres TEXT,
    recommandation VARCHAR(30) NOT NULL,
    commentaire TEXT,
    date_evaluation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    temps_evaluation_minutes INTEGER,
    note_experience INTEGER,
    note_formation INTEGER,
    note_projets INTEGER,
    note_competence_technique INTEGER,
    
    CONSTRAINT fk_eval_demande FOREIGN KEY (demande_id) 
        REFERENCES demandes_reconnaissance_competence(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_recommandation CHECK (
        recommandation IN ('APPROUVER', 'REJETER', 'DEMANDER_COMPLEMENT', 'EN_COURS')
    ),
    
    CONSTRAINT chk_note_globale CHECK (
        note_globale IS NULL OR (note_globale >= 0 AND note_globale <= 100)
    ),
    
    CONSTRAINT chk_note_experience CHECK (
        note_experience IS NULL OR (note_experience >= 0 AND note_experience <= 25)
    ),
    
    CONSTRAINT chk_note_formation CHECK (
        note_formation IS NULL OR (note_formation >= 0 AND note_formation <= 25)
    ),
    
    CONSTRAINT chk_note_projets CHECK (
        note_projets IS NULL OR (note_projets >= 0 AND note_projets <= 25)
    ),
    
    CONSTRAINT chk_note_competence_technique CHECK (
        note_competence_technique IS NULL OR (note_competence_technique >= 0 AND note_competence_technique <= 25)
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_eval_demande ON evaluations_competence(demande_id);
CREATE INDEX IF NOT EXISTS idx_eval_traitant ON evaluations_competence(traitant_id);
CREATE INDEX IF NOT EXISTS idx_eval_recommandation ON evaluations_competence(recommandation);
CREATE INDEX IF NOT EXISTS idx_eval_date ON evaluations_competence(date_evaluation);

-- Commentaires
COMMENT ON TABLE evaluations_competence IS 'Table des évaluations des demandes de reconnaissance par les traitants';
COMMENT ON COLUMN evaluations_competence.demande_id IS 'ID de la demande évaluée';
COMMENT ON COLUMN evaluations_competence.traitant_id IS 'ID du traitant qui a effectué l''évaluation';
COMMENT ON COLUMN evaluations_competence.note_globale IS 'Note globale sur 100';
COMMENT ON COLUMN evaluations_competence.recommandation IS 'Recommandation du traitant';
COMMENT ON COLUMN evaluations_competence.temps_evaluation_minutes IS 'Durée de l''évaluation en minutes';
COMMENT ON COLUMN evaluations_competence.note_experience IS 'Note pour l''expérience sur 25';
COMMENT ON COLUMN evaluations_competence.note_formation IS 'Note pour la formation sur 25';
COMMENT ON COLUMN evaluations_competence.note_projets IS 'Note pour les projets sur 25';
COMMENT ON COLUMN evaluations_competence.note_competence_technique IS 'Note pour la compétence technique sur 25';
