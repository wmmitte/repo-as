-- Migration pour remplacer ordre_affichage par popularite dans les domaines métier
-- Renommer la colonne ordre_affichage en popularite dans domaines_metier
ALTER TABLE domaines_metier
RENAME COLUMN ordre_affichage TO popularite;

-- Renommer la colonne ordre_affichage en popularite dans sous_domaines_metier
ALTER TABLE sous_domaines_metier
RENAME COLUMN ordre_affichage TO popularite;

-- Ajouter un commentaire pour clarifier la sémantique
COMMENT ON COLUMN domaines_metier.popularite IS 'Score de popularité du domaine métier (plus élevé = plus populaire)';
COMMENT ON COLUMN sous_domaines_metier.popularite IS 'Score de popularité du sous-domaine métier (plus élevé = plus populaire)';
