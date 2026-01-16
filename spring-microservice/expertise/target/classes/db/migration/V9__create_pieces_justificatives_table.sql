-- Migration pour créer la table des pièces justificatives

CREATE TABLE IF NOT EXISTS pieces_justificatives (
    id BIGSERIAL PRIMARY KEY,
    demande_id BIGINT NOT NULL,
    type_piece VARCHAR(30) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nom_original VARCHAR(255),
    url_fichier VARCHAR(500) NOT NULL,
    taille_octets BIGINT,
    type_mime VARCHAR(100),
    description VARCHAR(1000),
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    est_verifie BOOLEAN DEFAULT FALSE,
    date_verification TIMESTAMP,
    
    CONSTRAINT fk_piece_demande FOREIGN KEY (demande_id) 
        REFERENCES demandes_reconnaissance_competence(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_type_piece CHECK (
        type_piece IN ('CERTIFICAT', 'DIPLOME', 'PROJET', 'RECOMMANDATION', 'EXPERIENCE', 'PUBLICATION', 'AUTRE')
    )
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_piece_demande ON pieces_justificatives(demande_id);
CREATE INDEX IF NOT EXISTS idx_piece_type ON pieces_justificatives(type_piece);
CREATE INDEX IF NOT EXISTS idx_piece_verifie ON pieces_justificatives(est_verifie);
CREATE INDEX IF NOT EXISTS idx_piece_date_ajout ON pieces_justificatives(date_ajout);

-- Commentaires
COMMENT ON TABLE pieces_justificatives IS 'Table des pièces justificatives attachées aux demandes de reconnaissance';
COMMENT ON COLUMN pieces_justificatives.demande_id IS 'ID de la demande de reconnaissance';
COMMENT ON COLUMN pieces_justificatives.type_piece IS 'Type de pièce justificative';
COMMENT ON COLUMN pieces_justificatives.url_fichier IS 'Chemin de stockage du fichier';
COMMENT ON COLUMN pieces_justificatives.est_verifie IS 'Indique si la pièce a été vérifiée par le traitant';
