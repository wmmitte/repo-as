-- Migration initiale pour créer la table utilisateurs
-- V1__Initial_Schema.sql
-- Structure finale conforme à l'entité Utilisateur.java

CREATE TABLE IF NOT EXISTS utilisateurs (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Type de personne (physique ou morale)
    type_personne VARCHAR(20) NOT NULL DEFAULT 'PHYSIQUE',

    -- Informations de base
    nom VARCHAR(255),
    prenom VARCHAR(255),
    photo_url VARCHAR(255),

    -- Informations personnelles
    telephone VARCHAR(255),
    date_naissance TIMESTAMP,

    -- Informations professionnelles
    domaine_expertise VARCHAR(255),
    experience VARCHAR(255),
    biographie VARCHAR(2000),
    domaines_interet TEXT,

    -- Flag profil complet
    profil_complet BOOLEAN NOT NULL DEFAULT FALSE,

    -- OAuth providers
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,

    -- Auth locale
    mot_de_passe_hash VARCHAR(255),

    -- Métadonnées
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP,
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_google_id ON utilisateurs(google_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_facebook_id ON utilisateurs(facebook_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_apple_id ON utilisateurs(apple_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_profil_complet ON utilisateurs(profil_complet);

-- Commentaires
COMMENT ON TABLE utilisateurs IS 'Table des utilisateurs de la plateforme';
COMMENT ON COLUMN utilisateurs.type_personne IS 'Type: PHYSIQUE (particulier) ou MORALE (organisation)';
