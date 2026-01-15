-- Migration pour créer la table des demandes de reconnaissance de compétence

CREATE TABLE IF NOT EXISTS demandes_reconnaissance_competence (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) NOT NULL,
    competence_id BIGINT NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_modification TIMESTAMP,
    date_traitement TIMESTAMP,
    traitant_id VARCHAR(255),
    commentaire_expert TEXT,
    commentaire_traitant TEXT,
    preuves TEXT,
    niveau_vise VARCHAR(20),
    priorite INTEGER DEFAULT 0,
    
    CONSTRAINT fk_demande_competence FOREIGN KEY (competence_id) 
        REFERENCES competences(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_statut CHECK (
        statut IN ('EN_ATTENTE', 'EN_COURS_TRAITEMENT', 'COMPLEMENT_REQUIS', 'APPROUVEE', 'REJETEE', 'ANNULEE')
    ),
    
    CONSTRAINT chk_niveau_vise CHECK (
        niveau_vise IS NULL OR niveau_vise IN ('BRONZE', 'ARGENT', 'OR', 'PLATINE')
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_demande_utilisateur ON demandes_reconnaissance_competence(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_demande_competence ON demandes_reconnaissance_competence(competence_id);
CREATE INDEX IF NOT EXISTS idx_demande_statut ON demandes_reconnaissance_competence(statut);
CREATE INDEX IF NOT EXISTS idx_demande_traitant ON demandes_reconnaissance_competence(traitant_id);
CREATE INDEX IF NOT EXISTS idx_demande_date_creation ON demandes_reconnaissance_competence(date_creation);
CREATE INDEX IF NOT EXISTS idx_demande_priorite_date ON demandes_reconnaissance_competence(priorite DESC, date_creation ASC);

-- Commentaires
COMMENT ON TABLE demandes_reconnaissance_competence IS 'Table des demandes de reconnaissance de compétences soumises par les experts';
COMMENT ON COLUMN demandes_reconnaissance_competence.utilisateur_id IS 'ID de l''expert qui soumet la demande';
COMMENT ON COLUMN demandes_reconnaissance_competence.competence_id IS 'ID de la compétence concernée';
COMMENT ON COLUMN demandes_reconnaissance_competence.statut IS 'Statut actuel de la demande';
COMMENT ON COLUMN demandes_reconnaissance_competence.traitant_id IS 'ID du traitant assigné à la demande';
COMMENT ON COLUMN demandes_reconnaissance_competence.niveau_vise IS 'Niveau de certification visé (BRONZE, ARGENT, OR, PLATINE)';
COMMENT ON COLUMN demandes_reconnaissance_competence.priorite IS 'Priorité de traitement (0=normale, 1=haute, etc.)';
