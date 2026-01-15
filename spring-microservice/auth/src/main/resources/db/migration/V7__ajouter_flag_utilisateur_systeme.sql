-- Migration V7 : Ajouter colonne pour identifier les utilisateurs système
-- Date : 2026-01-14
-- Description : Permet de distinguer les utilisateurs système (créés automatiquement)
--               des utilisateurs normaux (inscrits via le portail)

-- Ajouter colonne est_utilisateur_systeme
ALTER TABLE utilisateurs
ADD COLUMN est_utilisateur_systeme BOOLEAN DEFAULT FALSE NOT NULL;

-- Créer index pour optimiser les requêtes de recherche des utilisateurs système
CREATE INDEX idx_utilisateur_systeme
ON utilisateurs(est_utilisateur_systeme)
WHERE est_utilisateur_systeme = true;

-- Commentaire sur la colonne
COMMENT ON COLUMN utilisateurs.est_utilisateur_systeme IS
'Indique si l''utilisateur est un utilisateur système (true) ou un utilisateur normal (false)';
