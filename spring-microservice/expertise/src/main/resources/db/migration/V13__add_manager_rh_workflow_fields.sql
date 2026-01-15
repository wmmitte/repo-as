-- Migration pour ajouter les champs du workflow Manager/RH

-- Ajouter les nouveaux champs
ALTER TABLE demandes_reconnaissance_competence
ADD COLUMN IF NOT EXISTS manager_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS date_assignation TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_evaluation TIMESTAMP;

-- Supprimer l'ancienne contrainte de statut
ALTER TABLE demandes_reconnaissance_competence
DROP CONSTRAINT IF EXISTS chk_statut;

-- Ajouter la nouvelle contrainte avec les nouveaux statuts
ALTER TABLE demandes_reconnaissance_competence
ADD CONSTRAINT chk_statut CHECK (
    statut IN (
        'EN_ATTENTE',
        'ASSIGNEE_RH',
        'EN_COURS_EVALUATION',
        'EN_ATTENTE_VALIDATION',
        'EN_COURS_TRAITEMENT',  -- Deprecated mais conservé pour rétrocompatibilité
        'COMPLEMENT_REQUIS',
        'APPROUVEE',
        'REJETEE',
        'ANNULEE'
    )
);

-- Index pour les recherches par manager
CREATE INDEX IF NOT EXISTS idx_demande_manager ON demandes_reconnaissance_competence(manager_id);
CREATE INDEX IF NOT EXISTS idx_demande_manager_statut ON demandes_reconnaissance_competence(manager_id, statut);

-- Index pour les recherches par date d'assignation et évaluation
CREATE INDEX IF NOT EXISTS idx_demande_date_assignation ON demandes_reconnaissance_competence(date_assignation);
CREATE INDEX IF NOT EXISTS idx_demande_date_evaluation ON demandes_reconnaissance_competence(date_evaluation);

-- Commentaires sur les nouveaux champs
COMMENT ON COLUMN demandes_reconnaissance_competence.manager_id IS 'ID du manager qui a assigné la demande au RH';
COMMENT ON COLUMN demandes_reconnaissance_competence.date_assignation IS 'Date d''assignation de la demande au RH par le manager';
COMMENT ON COLUMN demandes_reconnaissance_competence.date_evaluation IS 'Date de soumission de l''évaluation par le RH au manager';
