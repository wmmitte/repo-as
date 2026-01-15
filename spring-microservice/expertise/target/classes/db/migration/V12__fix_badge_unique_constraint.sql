-- Migration pour corriger la contrainte unique sur les badges
-- Problème : la contrainte actuelle empêche d'avoir plusieurs badges (actifs/inactifs) 
-- pour la même compétence, ce qui bloque la progression (bronze -> argent, etc.)
-- Solution : Remplacer par une contrainte partielle qui s'applique uniquement aux badges actifs

-- Supprimer l'ancienne contrainte
ALTER TABLE badges_competence DROP CONSTRAINT IF EXISTS uq_utilisateur_competence_actif;

-- Créer un index unique partiel qui s'applique uniquement aux badges actifs
-- Cela permet d'avoir plusieurs badges pour la même compétence (historique),
-- mais un seul badge actif à la fois
CREATE UNIQUE INDEX uq_utilisateur_competence_actif 
    ON badges_competence(competence_id, utilisateur_id) 
    WHERE est_actif = true;

-- Commentaire
COMMENT ON INDEX uq_utilisateur_competence_actif IS 
    'Un utilisateur ne peut avoir qu''un seul badge ACTIF par compétence (permet l''historique des badges inactifs)';
