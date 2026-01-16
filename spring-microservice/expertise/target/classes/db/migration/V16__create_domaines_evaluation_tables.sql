-- Migration V16: Création des tables pour la structuration des domaines de compétences
-- avec critères et méthodes d'évaluation

-- ============================================================================
-- 1. TABLE: domaines_competence (Classification pédagogique)
-- ============================================================================
CREATE TABLE domaines_competence (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_domaines_competence_code ON domaines_competence(code);
CREATE INDEX idx_domaines_competence_actif ON domaines_competence(est_actif);

-- Commentaires
COMMENT ON TABLE domaines_competence IS 'Domaines de compétences selon la classification pédagogique (SAVOIR, SAVOIR_FAIRE, SAVOIR_ETRE, SAVOIR_AGIR)';
COMMENT ON COLUMN domaines_competence.code IS 'Code unique du domaine (SAVOIR, SAVOIR_FAIRE, SAVOIR_ETRE, SAVOIR_AGIR)';

-- ============================================================================
-- 2. TABLE: criteres_evaluation
-- ============================================================================
CREATE TABLE criteres_evaluation (
    id BIGSERIAL PRIMARY KEY,
    domaine_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_critere_domaine FOREIGN KEY (domaine_id)
        REFERENCES domaines_competence(id) ON DELETE CASCADE,
    CONSTRAINT uk_critere_domaine_code UNIQUE (domaine_id, code)
);

-- Index
CREATE INDEX idx_criteres_domaine ON criteres_evaluation(domaine_id);
CREATE INDEX idx_criteres_actif ON criteres_evaluation(est_actif);

-- Commentaires
COMMENT ON TABLE criteres_evaluation IS 'Critères d''évaluation spécifiques à chaque domaine de compétence';
COMMENT ON COLUMN criteres_evaluation.domaine_id IS 'Référence vers le domaine de compétence';

-- ============================================================================
-- 3. TABLE: methodes_evaluation
-- ============================================================================
CREATE TABLE methodes_evaluation (
    id BIGSERIAL PRIMARY KEY,
    domaine_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    type_methode VARCHAR(50),
    ordre_affichage INTEGER,
    est_recommande BOOLEAN DEFAULT TRUE,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_methode_domaine FOREIGN KEY (domaine_id)
        REFERENCES domaines_competence(id) ON DELETE CASCADE,
    CONSTRAINT uk_methode_domaine_code UNIQUE (domaine_id, code)
);

-- Index
CREATE INDEX idx_methodes_domaine ON methodes_evaluation(domaine_id);
CREATE INDEX idx_methodes_type ON methodes_evaluation(type_methode);
CREATE INDEX idx_methodes_actif ON methodes_evaluation(est_actif);

-- Commentaires
COMMENT ON TABLE methodes_evaluation IS 'Méthodes d''évaluation recommandées pour chaque domaine de compétence';
COMMENT ON COLUMN methodes_evaluation.type_methode IS 'Type de méthode: THEORIQUE, PRATIQUE, COMPORTEMENTAL, INTEGRE';

-- ============================================================================
-- 4. TABLE: domaines_metier (Classification thématique/métier)
-- ============================================================================
CREATE TABLE domaines_metier (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    icone VARCHAR(50),
    couleur VARCHAR(20),
    ordre_affichage INTEGER,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_domaines_metier_code ON domaines_metier(code);
CREATE INDEX idx_domaines_metier_actif ON domaines_metier(est_actif);

-- Commentaires
COMMENT ON TABLE domaines_metier IS 'Domaines métiers/thématiques (Technique, Management, Relationnel, etc.)';
COMMENT ON COLUMN domaines_metier.icone IS 'Icône pour l''interface utilisateur';
COMMENT ON COLUMN domaines_metier.couleur IS 'Couleur hexadécimale pour identification visuelle';

-- ============================================================================
-- 5. TABLE: sous_domaines_metier
-- ============================================================================
CREATE TABLE sous_domaines_metier (
    id BIGSERIAL PRIMARY KEY,
    domaine_metier_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sousdomaine_domaine FOREIGN KEY (domaine_metier_id)
        REFERENCES domaines_metier(id) ON DELETE CASCADE,
    CONSTRAINT uk_sousdomaine_code UNIQUE (domaine_metier_id, code)
);

-- Index
CREATE INDEX idx_sousdomaines_domaine ON sous_domaines_metier(domaine_metier_id);
CREATE INDEX idx_sousdomaines_actif ON sous_domaines_metier(est_actif);

-- Commentaires
COMMENT ON TABLE sous_domaines_metier IS 'Sous-domaines métiers pour classification fine (Java, Python, etc.)';

-- ============================================================================
-- 6. MODIFICATION: competences_reference
-- ============================================================================

-- Ajouter les nouvelles colonnes
ALTER TABLE competences_reference
ADD COLUMN domaine_competence_id BIGINT,
ADD COLUMN domaine_metier_id BIGINT,
ADD COLUMN sous_domaine_metier_id BIGINT;

-- Ajouter les contraintes de clé étrangère
ALTER TABLE competences_reference
ADD CONSTRAINT fk_competence_domaine_competence
    FOREIGN KEY (domaine_competence_id)
    REFERENCES domaines_competence(id) ON DELETE SET NULL;

ALTER TABLE competences_reference
ADD CONSTRAINT fk_competence_domaine_metier
    FOREIGN KEY (domaine_metier_id)
    REFERENCES domaines_metier(id) ON DELETE SET NULL;

ALTER TABLE competences_reference
ADD CONSTRAINT fk_competence_sous_domaine
    FOREIGN KEY (sous_domaine_metier_id)
    REFERENCES sous_domaines_metier(id) ON DELETE SET NULL;

-- Créer les index
CREATE INDEX idx_competence_domaine_competence ON competences_reference(domaine_competence_id);
CREATE INDEX idx_competence_domaine_metier ON competences_reference(domaine_metier_id);
CREATE INDEX idx_competence_sous_domaine ON competences_reference(sous_domaine_metier_id);

-- Commentaires
COMMENT ON COLUMN competences_reference.domaine_competence_id IS 'Référence vers le domaine de compétence (classification pédagogique)';
COMMENT ON COLUMN competences_reference.domaine_metier_id IS 'Référence vers le domaine métier (classification thématique)';
COMMENT ON COLUMN competences_reference.sous_domaine_metier_id IS 'Référence vers le sous-domaine métier (optionnel)';
