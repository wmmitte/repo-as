-- Migration V1: Création de la table competences
-- Date: 2024

CREATE TABLE competences (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    niveau_maitrise INTEGER CHECK (niveau_maitrise >= 1 AND niveau_maitrise <= 5),
    annees_experience INTEGER,
    est_favorite BOOLEAN DEFAULT FALSE,
    nombre_demandes INTEGER DEFAULT 0,
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    
    -- Index pour améliorer les performances
    CONSTRAINT unique_user_competence UNIQUE (utilisateur_id, nom)
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_competences_utilisateur ON competences(utilisateur_id);
CREATE INDEX idx_competences_favorite ON competences(utilisateur_id, est_favorite);

-- Commentaires
COMMENT ON TABLE competences IS 'Table des compétences techniques des utilisateurs';
COMMENT ON COLUMN competences.utilisateur_id IS 'ID de l''utilisateur (référence vers le service auth)';
COMMENT ON COLUMN competences.niveau_maitrise IS 'Niveau de maîtrise de 1 (débutant) à 5 (expert)';
COMMENT ON COLUMN competences.est_favorite IS 'Indique si c''est une compétence principale/favorite';
COMMENT ON COLUMN competences.nombre_demandes IS 'Nombre de demandes reçues pour cette compétence';
