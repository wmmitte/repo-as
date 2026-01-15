-- Migration pour supprimer la colonne niveau_vise de la table demandes_reconnaissance_competence
-- Le système détermine désormais automatiquement le niveau de certification
-- basé sur les badges existants (BRONZE -> ARGENT -> OR -> PLATINE)

ALTER TABLE demandes_reconnaissance_competence
DROP COLUMN IF EXISTS niveau_vise;
