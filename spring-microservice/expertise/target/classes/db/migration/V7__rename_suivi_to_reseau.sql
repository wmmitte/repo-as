-- Migration V7: Création de la table reseau_expertises et ajouts manquants
-- Date: 2025-12-10

-- 1. Création de la table reseau_expertises (réseau de suivi des experts)
CREATE TABLE IF NOT EXISTS reseau_expertises (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) NOT NULL,
    expert_id VARCHAR(255) NOT NULL,
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reseau_utilisateur_expert UNIQUE (utilisateur_id, expert_id)
);

CREATE INDEX IF NOT EXISTS idx_reseau_utilisateur ON reseau_expertises(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_reseau_expert ON reseau_expertises(expert_id);
CREATE INDEX IF NOT EXISTS idx_reseau_date ON reseau_expertises(date_ajout);

-- 2. Création de la table certifications
CREATE TABLE IF NOT EXISTS certifications (
    id BIGSERIAL PRIMARY KEY,
    intitule VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    organisme_delivrant VARCHAR(200),
    url_verification VARCHAR(500),
    est_active BOOLEAN NOT NULL DEFAULT true,
    indice_popularite INTEGER NOT NULL DEFAULT 0,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP
);

-- 3. Création de la table pays
CREATE TABLE IF NOT EXISTS pays (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    code_iso VARCHAR(3) UNIQUE,
    est_actif BOOLEAN DEFAULT true,
    indice_popularite INTEGER DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP
);

-- 4. Création de la table villes
CREATE TABLE IF NOT EXISTS villes (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    pays_id BIGINT NOT NULL REFERENCES pays(id),
    code_postal VARCHAR(20),
    est_actif BOOLEAN DEFAULT true,
    indice_popularite INTEGER DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    UNIQUE(nom, pays_id)
);

-- 5. Ajout de competence_reference_id dans competences
ALTER TABLE competences ADD COLUMN IF NOT EXISTS competence_reference_id BIGINT;
ALTER TABLE competences ADD CONSTRAINT fk_competence_reference
    FOREIGN KEY (competence_reference_id) REFERENCES competences_reference(id);
CREATE INDEX IF NOT EXISTS idx_competences_reference_id ON competences(competence_reference_id);

-- 6. Ajout de la contrainte FK pour expertises.ville_id
ALTER TABLE expertises ADD CONSTRAINT fk_expertise_ville
    FOREIGN KEY (ville_id) REFERENCES villes(id);
