#!/bin/bash

echo "🔧 Ajout des colonnes manquantes dans la table competences..."

docker exec postgres17 psql -U postgres -d expertise_db << 'EOF'
-- Ajouter les colonnes si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter thm
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='competences' AND column_name='thm') THEN
        ALTER TABLE competences ADD COLUMN thm INTEGER;
        RAISE NOTICE '✓ Colonne thm ajoutée';
    ELSE
        RAISE NOTICE '  Colonne thm existe déjà';
    END IF;

    -- Ajouter nombre_projets
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='competences' AND column_name='nombre_projets') THEN
        ALTER TABLE competences ADD COLUMN nombre_projets INTEGER DEFAULT 0;
        RAISE NOTICE '✓ Colonne nombre_projets ajoutée';
    ELSE
        RAISE NOTICE '  Colonne nombre_projets existe déjà';
    END IF;

    -- Ajouter certifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='competences' AND column_name='certifications') THEN
        ALTER TABLE competences ADD COLUMN certifications VARCHAR(500);
        RAISE NOTICE '✓ Colonne certifications ajoutée';
    ELSE
        RAISE NOTICE '  Colonne certifications existe déjà';
    END IF;
END $$;

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_competences_thm ON competences(thm);
CREATE INDEX IF NOT EXISTS idx_competences_nombre_projets ON competences(nombre_projets);

-- Afficher les colonnes
\echo ''
\echo '📋 Colonnes de la table competences:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='competences' 
ORDER BY ordinal_position;
EOF

echo ""
echo "✅ Terminé !"
