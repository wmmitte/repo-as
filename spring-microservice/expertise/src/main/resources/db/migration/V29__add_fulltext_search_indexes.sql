-- Migration V29: Ajout des index Full-Text Search pour recherche avancée
-- PostgreSQL utilise tsvector/tsquery pour la recherche textuelle

-- 1. Ajouter une colonne tsvector pour la recherche sur expertises
ALTER TABLE expertises ADD COLUMN IF NOT EXISTS recherche_texte tsvector;

-- 2. Créer une fonction pour générer le vecteur de recherche d'une expertise
CREATE OR REPLACE FUNCTION generer_recherche_expertise()
RETURNS TRIGGER AS $$
BEGIN
    NEW.recherche_texte :=
        setweight(to_tsvector('french', COALESCE(NEW.titre, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le trigger pour mise à jour automatique
DROP TRIGGER IF EXISTS trigger_recherche_expertise ON expertises;
CREATE TRIGGER trigger_recherche_expertise
    BEFORE INSERT OR UPDATE OF titre, description
    ON expertises
    FOR EACH ROW
    EXECUTE FUNCTION generer_recherche_expertise();

-- 4. Mettre à jour les données existantes
UPDATE expertises SET recherche_texte =
    setweight(to_tsvector('french', COALESCE(titre, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B');

-- 5. Créer l'index GIN pour recherche rapide sur expertises
CREATE INDEX IF NOT EXISTS idx_expertises_recherche_texte
    ON expertises USING GIN(recherche_texte);

-- 6. Ajouter une colonne tsvector pour les compétences
ALTER TABLE competences ADD COLUMN IF NOT EXISTS recherche_texte tsvector;

-- 7. Fonction pour générer le vecteur de recherche d'une compétence
CREATE OR REPLACE FUNCTION generer_recherche_competence()
RETURNS TRIGGER AS $$
BEGIN
    NEW.recherche_texte :=
        setweight(to_tsvector('french', COALESCE(NEW.nom, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(NEW.certifications, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger pour compétences
DROP TRIGGER IF EXISTS trigger_recherche_competence ON competences;
CREATE TRIGGER trigger_recherche_competence
    BEFORE INSERT OR UPDATE OF nom, description, certifications
    ON competences
    FOR EACH ROW
    EXECUTE FUNCTION generer_recherche_competence();

-- 9. Mettre à jour les compétences existantes
UPDATE competences SET recherche_texte =
    setweight(to_tsvector('french', COALESCE(nom, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(certifications, '')), 'C');

-- 10. Index GIN pour compétences
CREATE INDEX IF NOT EXISTS idx_competences_recherche_texte
    ON competences USING GIN(recherche_texte);

-- 11. Index composites pour filtres fréquents
CREATE INDEX IF NOT EXISTS idx_competences_utilisateur_niveau
    ON competences(utilisateur_id, niveau_maitrise);

CREATE INDEX IF NOT EXISTS idx_competences_utilisateur_experience
    ON competences(utilisateur_id, annees_experience);

CREATE INDEX IF NOT EXISTS idx_competences_utilisateur_thm
    ON competences(utilisateur_id, thm);

-- 12. Index pour badges actifs par utilisateur et niveau
CREATE INDEX IF NOT EXISTS idx_badges_utilisateur_niveau_actif
    ON badges_competence(utilisateur_id, niveau_certification)
    WHERE est_actif = true;

-- 13. Index pour compter les followers
CREATE INDEX IF NOT EXISTS idx_reseau_expert_count
    ON reseau_expertises(expert_id);

-- 14. Vue matérialisée pour statistiques experts (optionnel, pour performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS vue_stats_experts AS
SELECT
    e.utilisateur_id,
    e.id as expertise_id,
    e.titre,
    e.description,
    e.score_global,
    e.disponible,
    e.publiee,
    e.recherche_texte,
    v.id as ville_id,
    v.nom as ville_nom,
    p.id as pays_id,
    p.nom as pays_nom,
    COALESCE(comp_stats.nombre_competences, 0) as nombre_competences,
    COALESCE(comp_stats.niveau_max, 0) as niveau_maitrise_max,
    COALESCE(comp_stats.experience_max, 0) as annees_experience_max,
    COALESCE(comp_stats.thm_min, 0) as thm_min,
    COALESCE(comp_stats.thm_max, 0) as thm_max,
    COALESCE(comp_stats.projets_total, 0) as projets_total,
    COALESCE(badge_stats.nombre_badges, 0) as nombre_badges,
    COALESCE(badge_stats.niveau_badge_max, 'AUCUN') as niveau_badge_max,
    COALESCE(reseau_stats.nombre_followers, 0) as nombre_followers
FROM expertises e
LEFT JOIN villes v ON e.ville_id = v.id
LEFT JOIN pays p ON v.pays_id = p.id
LEFT JOIN (
    SELECT
        utilisateur_id,
        COUNT(*) as nombre_competences,
        MAX(niveau_maitrise) as niveau_max,
        MAX(annees_experience) as experience_max,
        MIN(thm) FILTER (WHERE thm > 0) as thm_min,
        MAX(thm) as thm_max,
        SUM(COALESCE(nombre_projets, 0)) as projets_total
    FROM competences
    GROUP BY utilisateur_id
) comp_stats ON e.utilisateur_id = comp_stats.utilisateur_id
LEFT JOIN (
    SELECT
        utilisateur_id,
        COUNT(*) as nombre_badges,
        MAX(niveau_certification::text) as niveau_badge_max
    FROM badges_competence
    WHERE est_actif = true
    GROUP BY utilisateur_id
) badge_stats ON e.utilisateur_id = badge_stats.utilisateur_id
LEFT JOIN (
    SELECT
        expert_id,
        COUNT(*) as nombre_followers
    FROM reseau_expertises
    GROUP BY expert_id
) reseau_stats ON e.utilisateur_id = reseau_stats.expert_id
WHERE e.publiee = true;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_vue_stats_experts_utilisateur
    ON vue_stats_experts(utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_vue_stats_experts_score
    ON vue_stats_experts(score_global DESC);

CREATE INDEX IF NOT EXISTS idx_vue_stats_experts_recherche
    ON vue_stats_experts USING GIN(recherche_texte);

-- 15. Fonction pour rafraîchir la vue matérialisée (à appeler périodiquement ou après modifications importantes)
CREATE OR REPLACE FUNCTION rafraichir_stats_experts()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY vue_stats_experts;
END;
$$ LANGUAGE plpgsql;

-- Commentaire: Pour rafraîchir la vue, exécuter: SELECT rafraichir_stats_experts();
