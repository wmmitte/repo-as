-- Migration V5: Ajout des champs THM, nombre de projets et certifications aux compétences
-- Date: 2025-11-15

-- Ajouter les nouvelles colonnes
ALTER TABLE competences 
ADD COLUMN thm INTEGER,
ADD COLUMN nombre_projets INTEGER DEFAULT 0,
ADD COLUMN certifications VARCHAR(500);

-- Créer un index sur thm pour les recherches par taux horaire
CREATE INDEX idx_competences_thm ON competences(thm);

-- Créer un index sur nombre_projets pour les recherches
CREATE INDEX idx_competences_nombre_projets ON competences(nombre_projets);
