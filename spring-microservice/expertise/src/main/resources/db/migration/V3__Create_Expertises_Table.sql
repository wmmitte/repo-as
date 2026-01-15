-- Migration V3: Création de la table expertises
-- Table pour stocker le profil d'expertise complet de chaque utilisateur
-- Relation 1:1 avec utilisateur

CREATE TABLE expertises (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) NOT NULL UNIQUE,
    titre VARCHAR(200),
    description TEXT,
    photo_url VARCHAR(500),
    ville_id BIGINT,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    publiee BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_expertises_utilisateur ON expertises(utilisateur_id);
CREATE INDEX idx_expertises_publiee ON expertises(publiee) WHERE publiee = TRUE;
CREATE INDEX idx_expertises_ville ON expertises(ville_id);

-- Commentaires
COMMENT ON TABLE expertises IS 'Table des profils d''expertise des utilisateurs';
COMMENT ON COLUMN expertises.utilisateur_id IS 'ID UUID de l''utilisateur (référence vers le service auth) - Relation 1:1';
COMMENT ON COLUMN expertises.titre IS 'Titre professionnel (ex: Développeur Full Stack Senior)';
COMMENT ON COLUMN expertises.ville_id IS 'Référence vers la ville de localisation';
COMMENT ON COLUMN expertises.publiee IS 'Si TRUE, l''expertise est visible sur la page d''accueil publique';
COMMENT ON COLUMN expertises.disponible IS 'Indique si l''expert est disponible pour de nouveaux projets';
