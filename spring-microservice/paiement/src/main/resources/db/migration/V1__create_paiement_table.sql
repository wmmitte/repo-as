-- Table des paiements
CREATE TABLE IF NOT EXISTS tc_paiement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    devise VARCHAR(3) NOT NULL DEFAULT 'EUR',
    statut VARCHAR(20) NOT NULL,
    type VARCHAR(30) NOT NULL,
    reference VARCHAR(50) UNIQUE,
    description TEXT,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    CONSTRAINT chk_statut CHECK (statut IN ('EN_ATTENTE', 'VALIDE', 'REJETE', 'REMBOURSE')),
    CONSTRAINT chk_type CHECK (type IN ('CARTE_BANCAIRE', 'VIREMENT', 'MOBILE_MONEY', 'PAYPAL')),
    CONSTRAINT chk_montant CHECK (montant > 0)
);

-- Index pour améliorer les performances
CREATE INDEX idx_paiement_utilisateur ON tc_paiement(utilisateur_id);
CREATE INDEX idx_paiement_statut ON tc_paiement(statut);
CREATE INDEX idx_paiement_date_creation ON tc_paiement(date_creation);
CREATE INDEX idx_paiement_reference ON tc_paiement(reference);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE tc_paiement IS 'Table des paiements effectués par les utilisateurs';
COMMENT ON COLUMN tc_paiement.id IS 'Identifiant unique du paiement';
COMMENT ON COLUMN tc_paiement.utilisateur_id IS 'Identifiant de l''utilisateur ayant effectué le paiement';
COMMENT ON COLUMN tc_paiement.montant IS 'Montant du paiement';
COMMENT ON COLUMN tc_paiement.devise IS 'Devise du paiement (EUR, USD, XOF, etc.)';
COMMENT ON COLUMN tc_paiement.statut IS 'Statut du paiement (EN_ATTENTE, VALIDE, REJETE, REMBOURSE)';
COMMENT ON COLUMN tc_paiement.type IS 'Type de paiement (CARTE_BANCAIRE, VIREMENT, MOBILE_MONEY, PAYPAL)';
COMMENT ON COLUMN tc_paiement.reference IS 'Référence unique du paiement';
COMMENT ON COLUMN tc_paiement.description IS 'Description ou motif du paiement';
COMMENT ON COLUMN tc_paiement.date_creation IS 'Date de création du paiement';
COMMENT ON COLUMN tc_paiement.date_validation IS 'Date de validation ou rejet du paiement';
