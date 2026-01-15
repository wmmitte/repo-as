-- Migration pour créer la table des badges de compétence

CREATE TABLE IF NOT EXISTS badges_competence (
    id BIGSERIAL PRIMARY KEY,
    competence_id BIGINT NOT NULL,
    utilisateur_id VARCHAR(255) NOT NULL,
    demande_reconnaissance_id BIGINT,
    date_obtention TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    niveau_certification VARCHAR(20) NOT NULL,
    validite_permanente BOOLEAN DEFAULT TRUE,
    date_expiration TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE,
    date_revocation TIMESTAMP,
    motif_revocation TEXT,
    revoque_par VARCHAR(255),
    est_public BOOLEAN DEFAULT TRUE,
    ordre_affichage INTEGER DEFAULT 0,
    
    CONSTRAINT fk_badge_competence FOREIGN KEY (competence_id) 
        REFERENCES competences(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_badge_demande FOREIGN KEY (demande_reconnaissance_id) 
        REFERENCES demandes_reconnaissance_competence(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_niveau_certification CHECK (
        niveau_certification IN ('BRONZE', 'ARGENT', 'OR', 'PLATINE')
    ),
    
    -- Un utilisateur ne peut avoir qu'un badge actif par compétence
    CONSTRAINT uq_utilisateur_competence_actif UNIQUE (competence_id, utilisateur_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_badge_utilisateur ON badges_competence(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_badge_competence ON badges_competence(competence_id);
CREATE INDEX IF NOT EXISTS idx_badge_niveau ON badges_competence(niveau_certification);
CREATE INDEX IF NOT EXISTS idx_badge_actif ON badges_competence(est_actif);
CREATE INDEX IF NOT EXISTS idx_badge_public ON badges_competence(est_public);
CREATE INDEX IF NOT EXISTS idx_badge_demande ON badges_competence(demande_reconnaissance_id);
CREATE INDEX IF NOT EXISTS idx_badge_ordre ON badges_competence(utilisateur_id, ordre_affichage, date_obtention DESC);

-- Commentaires
COMMENT ON TABLE badges_competence IS 'Table des badges de compétence attribués aux utilisateurs';
COMMENT ON COLUMN badges_competence.competence_id IS 'ID de la compétence certifiée';
COMMENT ON COLUMN badges_competence.utilisateur_id IS 'ID de l''utilisateur qui possède le badge';
COMMENT ON COLUMN badges_competence.demande_reconnaissance_id IS 'ID de la demande de reconnaissance qui a généré ce badge';
COMMENT ON COLUMN badges_competence.niveau_certification IS 'Niveau de certification (BRONZE, ARGENT, OR, PLATINE)';
COMMENT ON COLUMN badges_competence.validite_permanente IS 'Indique si le badge est valide de manière permanente';
COMMENT ON COLUMN badges_competence.est_public IS 'Indique si le badge est visible publiquement sur le profil';
COMMENT ON COLUMN badges_competence.ordre_affichage IS 'Ordre d''affichage du badge sur le profil';
