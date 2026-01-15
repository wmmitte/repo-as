-- Migration pour ajouter le stockage de la photo en BLOB
-- V2__Add_Photo_Blob.sql

-- Colonne pour stocker l'image en bytes
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS photo_data BYTEA;

-- Colonne pour stocker le type MIME de l'image
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS photo_content_type VARCHAR(100);

-- Commentaires
COMMENT ON COLUMN utilisateurs.photo_data IS 'Photo de profil stockée en BLOB (bytes)';
COMMENT ON COLUMN utilisateurs.photo_content_type IS 'Type MIME de la photo (ex: image/jpeg, image/png)';
