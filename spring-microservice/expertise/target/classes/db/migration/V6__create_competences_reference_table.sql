-- Migration V6: Création de la table competences_reference pour le référentiel de compétences normalisé
-- Basé sur les standards internationaux (OCDE, UE, OIT)

CREATE TABLE IF NOT EXISTS competences_reference (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identification
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Classification
    type_competence VARCHAR(50),  -- SAVOIR, SAVOIR_FAIRE, SAVOIR_ETRE, SAVOIR_AGIR
    domaine VARCHAR(100),
    sous_domaine VARCHAR(100),
    niveau_taxonomie VARCHAR(50), -- MEMORISER, COMPRENDRE, APPLIQUER, ANALYSER, EVALUER, CREER
    
    -- Formulation normée
    verbe_action VARCHAR(100),
    objet VARCHAR(255),
    contexte TEXT,
    ressources_mobilisees TEXT,
    criteres_performance TEXT,
    
    -- Métadonnées
    referentiel VARCHAR(100),
    organisme VARCHAR(255),
    statut VARCHAR(50),           -- PROPOSITION, VALIDE, EN_REVISION, OBSOLETE
    
    -- Hiérarchie
    niveau_hierarchie INTEGER,
    competence_parent_id BIGINT,
    ordre_affichage INTEGER,
    
    -- Recherche et popularité
    mots_cles TEXT,
    indice_popularite INTEGER DEFAULT 0,
    
    -- Gestion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prochaine_revision TIMESTAMP,
    version INTEGER DEFAULT 1,
    est_active BOOLEAN DEFAULT TRUE,
    
    -- Contrainte de clé étrangère pour la hiérarchie
    CONSTRAINT fk_competence_parent FOREIGN KEY (competence_parent_id) 
        REFERENCES competences_reference(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_competences_ref_domaine ON competences_reference(domaine);
CREATE INDEX idx_competences_ref_type ON competences_reference(type_competence);
CREATE INDEX idx_competences_ref_statut ON competences_reference(statut);
CREATE INDEX idx_competences_ref_parent ON competences_reference(competence_parent_id);
CREATE INDEX idx_competences_ref_popularite ON competences_reference(indice_popularite DESC);
CREATE INDEX idx_competences_ref_active ON competences_reference(est_active);

-- Index full-text pour la recherche
CREATE INDEX idx_competences_ref_search ON competences_reference 
    USING gin(to_tsvector('french', coalesce(libelle, '') || ' ' || coalesce(description, '') || ' ' || coalesce(mots_cles, '')));

-- Commentaires sur la table
COMMENT ON TABLE competences_reference IS 'Référentiel de compétences normalisé selon les standards internationaux';
COMMENT ON COLUMN competences_reference.code IS 'Code unique de la compétence (ex: TECH-JAVA-001)';
COMMENT ON COLUMN competences_reference.niveau_taxonomie IS 'Niveau selon la taxonomie de Bloom révisée';
COMMENT ON COLUMN competences_reference.indice_popularite IS 'Nombre d''utilisations de cette compétence par les utilisateurs';
