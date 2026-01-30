-- =============================================================================
-- V30: Création des tables pour la gestion des projets
-- =============================================================================

-- Table principale des projets
CREATE TABLE projets (
    id BIGSERIAL PRIMARY KEY,
    proprietaire_id UUID NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    budget DECIMAL(15, 2) DEFAULT 0,
    devise VARCHAR(10) DEFAULT 'FCFA',

    -- Statut et visibilité
    statut VARCHAR(50) DEFAULT 'BROUILLON',
    visibilite VARCHAR(20) DEFAULT 'PRIVE',

    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_effective DATE,
    date_fin_effective DATE,

    -- Progression
    progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),

    -- Métadonnées
    nombre_vues INTEGER DEFAULT 0,

    CONSTRAINT chk_projet_statut CHECK (statut IN ('BROUILLON', 'PUBLIE', 'EN_COURS', 'EN_PAUSE', 'TERMINE', 'ANNULE')),
    CONSTRAINT chk_projet_visibilite CHECK (visibilite IN ('PRIVE', 'PUBLIC'))
);

-- Index pour les projets
CREATE INDEX idx_projets_proprietaire ON projets(proprietaire_id);
CREATE INDEX idx_projets_statut ON projets(statut);
CREATE INDEX idx_projets_visibilite ON projets(visibilite);
CREATE INDEX idx_projets_date_creation ON projets(date_creation DESC);
CREATE INDEX idx_projets_publies ON projets(visibilite, statut) WHERE visibilite = 'PUBLIC' AND statut = 'PUBLIE';

-- =============================================================================
-- Table des étapes (regroupement de tâches)
-- =============================================================================
CREATE TABLE etapes_projet (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    ordre INTEGER DEFAULT 0,

    -- Dates
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_effective DATE,
    date_fin_effective DATE,

    -- Progression calculée automatiquement depuis les tâches
    progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),

    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_etapes_projet ON etapes_projet(projet_id);
CREATE INDEX idx_etapes_ordre ON etapes_projet(projet_id, ordre);

-- =============================================================================
-- Table des tâches
-- =============================================================================
CREATE TABLE taches_projet (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    etape_id BIGINT REFERENCES etapes_projet(id) ON DELETE SET NULL,

    nom VARCHAR(255) NOT NULL,
    description TEXT,
    ordre INTEGER DEFAULT 0,

    -- Ressources
    budget DECIMAL(15, 2) DEFAULT 0,
    delai_jours INTEGER,

    -- Statut
    statut VARCHAR(50) DEFAULT 'A_FAIRE',
    visibilite VARCHAR(20) DEFAULT 'HERITEE',
    priorite VARCHAR(20) DEFAULT 'NORMALE',

    -- Progression
    progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),

    -- Expert assigné
    expert_assigne_id UUID,
    date_assignation TIMESTAMP,

    -- Dates
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_effective DATE,
    date_fin_effective DATE,

    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_tache_statut CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'EN_REVUE', 'TERMINEE', 'BLOQUEE', 'ANNULEE')),
    CONSTRAINT chk_tache_visibilite CHECK (visibilite IN ('HERITEE', 'PRIVE', 'PUBLIC')),
    CONSTRAINT chk_tache_priorite CHECK (priorite IN ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE'))
);

CREATE INDEX idx_taches_projet ON taches_projet(projet_id);
CREATE INDEX idx_taches_etape ON taches_projet(etape_id);
CREATE INDEX idx_taches_statut ON taches_projet(statut);
CREATE INDEX idx_taches_expert ON taches_projet(expert_assigne_id);
CREATE INDEX idx_taches_ordre ON taches_projet(projet_id, etape_id, ordre);

-- =============================================================================
-- Table de liaison tâches - compétences requises
-- =============================================================================
CREATE TABLE taches_competences_requises (
    id BIGSERIAL PRIMARY KEY,
    tache_id BIGINT NOT NULL REFERENCES taches_projet(id) ON DELETE CASCADE,
    competence_reference_id BIGINT NOT NULL REFERENCES competences_reference(id) ON DELETE CASCADE,
    niveau_requis INTEGER DEFAULT 3 CHECK (niveau_requis >= 1 AND niveau_requis <= 5),
    est_obligatoire BOOLEAN DEFAULT TRUE,

    UNIQUE(tache_id, competence_reference_id)
);

CREATE INDEX idx_taches_competences_tache ON taches_competences_requises(tache_id);
CREATE INDEX idx_taches_competences_competence ON taches_competences_requises(competence_reference_id);

-- =============================================================================
-- Table des dépendances entre tâches
-- =============================================================================
CREATE TABLE dependances_taches (
    id BIGSERIAL PRIMARY KEY,
    tache_id BIGINT NOT NULL REFERENCES taches_projet(id) ON DELETE CASCADE,
    tache_dependante_id BIGINT NOT NULL REFERENCES taches_projet(id) ON DELETE CASCADE,
    type_dependance VARCHAR(20) DEFAULT 'FIN_DEBUT',

    CONSTRAINT chk_dependance_type CHECK (type_dependance IN ('FIN_DEBUT', 'DEBUT_DEBUT', 'FIN_FIN', 'DEBUT_FIN')),
    CONSTRAINT chk_dependance_self CHECK (tache_id != tache_dependante_id),
    UNIQUE(tache_id, tache_dependante_id)
);

CREATE INDEX idx_dependances_tache ON dependances_taches(tache_id);
CREATE INDEX idx_dependances_dependante ON dependances_taches(tache_dependante_id);

-- =============================================================================
-- Table des livrables
-- =============================================================================
CREATE TABLE livrables_tache (
    id BIGSERIAL PRIMARY KEY,
    tache_id BIGINT NOT NULL REFERENCES taches_projet(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,

    -- Statut
    statut VARCHAR(50) DEFAULT 'A_FOURNIR',

    -- Fichier soumis
    fichier_url VARCHAR(500),
    fichier_nom VARCHAR(255),
    fichier_taille BIGINT,
    fichier_type VARCHAR(100),
    date_soumission TIMESTAMP,
    commentaire_soumission TEXT,

    -- Validation
    valide_par_id UUID,
    date_validation TIMESTAMP,
    commentaire_validation TEXT,

    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_livrable_statut CHECK (statut IN ('A_FOURNIR', 'SOUMIS', 'EN_REVUE', 'ACCEPTE', 'REFUSE', 'A_REVISER'))
);

CREATE INDEX idx_livrables_tache ON livrables_tache(tache_id);
CREATE INDEX idx_livrables_statut ON livrables_tache(statut);

-- =============================================================================
-- Table des critères d'acceptation des livrables
-- =============================================================================
CREATE TABLE criteres_acceptation_livrable (
    id BIGSERIAL PRIMARY KEY,
    livrable_id BIGINT NOT NULL REFERENCES livrables_tache(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    ordre INTEGER DEFAULT 0,
    est_valide BOOLEAN DEFAULT FALSE,
    commentaire TEXT,
    date_validation TIMESTAMP
);

CREATE INDEX idx_criteres_livrable ON criteres_acceptation_livrable(livrable_id);

-- =============================================================================
-- Table des candidatures d'experts sur les projets/tâches
-- =============================================================================
CREATE TABLE candidatures_projet (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    tache_id BIGINT REFERENCES taches_projet(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL,

    -- Proposition
    message TEXT,
    tarif_propose DECIMAL(15, 2),
    delai_propose_jours INTEGER,

    -- Statut
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',

    -- Réponse du client
    reponse_client TEXT,
    date_reponse TIMESTAMP,

    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_candidature_statut CHECK (statut IN ('EN_ATTENTE', 'EN_DISCUSSION', 'ACCEPTEE', 'REFUSEE', 'RETIREE'))
);

CREATE INDEX idx_candidatures_projet ON candidatures_projet(projet_id);
CREATE INDEX idx_candidatures_tache ON candidatures_projet(tache_id);
CREATE INDEX idx_candidatures_expert ON candidatures_projet(expert_id);
CREATE INDEX idx_candidatures_statut ON candidatures_projet(statut);
CREATE UNIQUE INDEX idx_candidatures_unique ON candidatures_projet(projet_id, tache_id, expert_id)
    WHERE statut NOT IN ('REFUSEE', 'RETIREE');

-- =============================================================================
-- Table des exigences du projet
-- =============================================================================
CREATE TABLE exigences_projet (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    categorie VARCHAR(100),
    priorite VARCHAR(20) DEFAULT 'NORMALE',
    ordre INTEGER DEFAULT 0,

    CONSTRAINT chk_exigence_priorite CHECK (priorite IN ('BASSE', 'NORMALE', 'HAUTE', 'CRITIQUE'))
);

CREATE INDEX idx_exigences_projet ON exigences_projet(projet_id);

-- =============================================================================
-- Table des commentaires/discussions sur les tâches
-- =============================================================================
CREATE TABLE commentaires_tache (
    id BIGSERIAL PRIMARY KEY,
    tache_id BIGINT NOT NULL REFERENCES taches_projet(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL,
    contenu TEXT NOT NULL,

    -- Réponse à un autre commentaire
    parent_id BIGINT REFERENCES commentaires_tache(id) ON DELETE CASCADE,

    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP
);

CREATE INDEX idx_commentaires_tache ON commentaires_tache(tache_id);
CREATE INDEX idx_commentaires_auteur ON commentaires_tache(auteur_id);
CREATE INDEX idx_commentaires_parent ON commentaires_tache(parent_id);

-- =============================================================================
-- Trigger pour mise à jour automatique de date_modification
-- =============================================================================
CREATE OR REPLACE FUNCTION maj_date_modification_projet()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maj_projet
    BEFORE UPDATE ON projets
    FOR EACH ROW
    EXECUTE FUNCTION maj_date_modification_projet();

CREATE TRIGGER trigger_maj_etape
    BEFORE UPDATE ON etapes_projet
    FOR EACH ROW
    EXECUTE FUNCTION maj_date_modification_projet();

CREATE TRIGGER trigger_maj_tache
    BEFORE UPDATE ON taches_projet
    FOR EACH ROW
    EXECUTE FUNCTION maj_date_modification_projet();

CREATE TRIGGER trigger_maj_livrable
    BEFORE UPDATE ON livrables_tache
    FOR EACH ROW
    EXECUTE FUNCTION maj_date_modification_projet();

CREATE TRIGGER trigger_maj_candidature
    BEFORE UPDATE ON candidatures_projet
    FOR EACH ROW
    EXECUTE FUNCTION maj_date_modification_projet();

-- =============================================================================
-- Vue pour les projets publics avec statistiques
-- =============================================================================
CREATE OR REPLACE VIEW vue_projets_publics AS
SELECT
    p.id,
    p.proprietaire_id,
    p.nom,
    p.description,
    p.budget,
    p.devise,
    p.statut,
    p.date_creation,
    p.date_debut_prevue,
    p.date_fin_prevue,
    p.nombre_vues,
    COUNT(DISTINCT e.id) as nombre_etapes,
    COUNT(DISTINCT t.id) as nombre_taches,
    COUNT(DISTINCT t.id) FILTER (WHERE t.expert_assigne_id IS NULL AND t.statut = 'A_FAIRE') as taches_disponibles,
    COUNT(DISTINCT c.id) FILTER (WHERE c.statut = 'EN_ATTENTE') as candidatures_en_attente,
    COALESCE(AVG(t.progression), 0) as progression_moyenne
FROM projets p
LEFT JOIN etapes_projet e ON e.projet_id = p.id
LEFT JOIN taches_projet t ON t.projet_id = p.id
LEFT JOIN candidatures_projet c ON c.projet_id = p.id
WHERE p.visibilite = 'PUBLIC' AND p.statut = 'PUBLIE'
GROUP BY p.id;

COMMENT ON TABLE projets IS 'Table principale des projets clients';
COMMENT ON TABLE etapes_projet IS 'Étapes (mini-projets) regroupant des tâches';
COMMENT ON TABLE taches_projet IS 'Tâches individuelles pouvant être indépendantes ou dans une étape';
COMMENT ON TABLE candidatures_projet IS 'Candidatures des experts sur les projets/tâches';
COMMENT ON TABLE livrables_tache IS 'Livrables attendus pour chaque tâche';
