-- Migration V18: Suppression de la colonne niveau_taxonomie de la table competences_reference
-- La classification taxonomique selon Bloom n'est plus utilisée dans le modèle de données

-- Supprimer le commentaire de la colonne
COMMENT ON COLUMN competences_reference.niveau_taxonomie IS NULL;

-- Supprimer la colonne niveau_taxonomie
ALTER TABLE competences_reference DROP COLUMN IF EXISTS niveau_taxonomie;
