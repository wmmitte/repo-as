-- =====================================================
-- Migration V26: Création de la table de jonction
-- entre critères d'évaluation et méthodes d'évaluation
-- =====================================================

-- Table de jonction pour la relation many-to-many
CREATE TABLE criteres_methodes (
    critere_id BIGINT NOT NULL,
    methode_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    PRIMARY KEY (critere_id, methode_id),

    -- Clés étrangères
    CONSTRAINT fk_criteres_methodes_critere
        FOREIGN KEY (critere_id)
        REFERENCES criteres_evaluation(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_criteres_methodes_methode
        FOREIGN KEY (methode_id)
        REFERENCES methodes_evaluation(id)
        ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_criteres_methodes_critere ON criteres_methodes(critere_id);
CREATE INDEX idx_criteres_methodes_methode ON criteres_methodes(methode_id);

-- Commentaires
COMMENT ON TABLE criteres_methodes IS 'Table de jonction pour associer les critères d''évaluation aux méthodes d''évaluation (relation N-N)';
COMMENT ON COLUMN criteres_methodes.critere_id IS 'ID du critère d''évaluation';
COMMENT ON COLUMN criteres_methodes.methode_id IS 'ID de la méthode d''évaluation';
COMMENT ON COLUMN criteres_methodes.created_at IS 'Date de création de l''association';
