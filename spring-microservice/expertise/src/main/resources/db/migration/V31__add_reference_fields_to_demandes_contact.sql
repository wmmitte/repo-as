-- Ajout des champs de référence pour les notifications avec liens
ALTER TABLE demandes_contact ADD COLUMN type_reference VARCHAR(50);
ALTER TABLE demandes_contact ADD COLUMN reference_id BIGINT;
ALTER TABLE demandes_contact ADD COLUMN lien_reference VARCHAR(500);
ALTER TABLE demandes_contact ADD COLUMN est_notification_systeme BOOLEAN DEFAULT FALSE;

-- Index pour améliorer les performances des recherches par référence
CREATE INDEX idx_demandes_contact_reference ON demandes_contact(type_reference, reference_id);
CREATE INDEX idx_demandes_contact_notification ON demandes_contact(est_notification_systeme);
