-- Table des demandes de contact entre utilisateurs
CREATE TABLE demandes_contact (
    id BIGSERIAL PRIMARY KEY,
    expediteur_id VARCHAR(255) NOT NULL,
    destinataire_id VARCHAR(255) NOT NULL,
    objet VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    email_reponse VARCHAR(255),
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_lecture TIMESTAMP,
    date_reponse TIMESTAMP,

    CONSTRAINT chk_statut_demande_contact CHECK (statut IN ('EN_ATTENTE', 'LUE', 'REPONDUE', 'ARCHIVEE'))
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_demandes_contact_expediteur ON demandes_contact(expediteur_id);
CREATE INDEX idx_demandes_contact_destinataire ON demandes_contact(destinataire_id);
CREATE INDEX idx_demandes_contact_statut ON demandes_contact(statut);
CREATE INDEX idx_demandes_contact_destinataire_statut ON demandes_contact(destinataire_id, statut);

-- Commentaires
COMMENT ON TABLE demandes_contact IS 'Table des demandes de contact entre utilisateurs';
COMMENT ON COLUMN demandes_contact.expediteur_id IS 'ID de l''utilisateur qui envoie le message';
COMMENT ON COLUMN demandes_contact.destinataire_id IS 'ID de l''utilisateur qui reçoit le message';
COMMENT ON COLUMN demandes_contact.objet IS 'Objet du message';
COMMENT ON COLUMN demandes_contact.message IS 'Contenu du message';
COMMENT ON COLUMN demandes_contact.email_reponse IS 'Email de réponse optionnel';
COMMENT ON COLUMN demandes_contact.statut IS 'Statut de la demande: EN_ATTENTE, LUE, REPONDUE, ARCHIVEE';
