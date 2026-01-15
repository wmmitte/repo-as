-- Migration V3: Ajout des champs pour la vérification d'email
-- Permet de valider que l'utilisateur possède bien l'adresse email fournie

-- Ajout du champ email_verifie (par défaut FALSE pour les nouveaux utilisateurs)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_verifie BOOLEAN NOT NULL DEFAULT FALSE;

-- Ajout du token de vérification (unique pour chaque utilisateur)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS token_verification_email VARCHAR(255);

-- Ajout de la date d'expiration du token (72h après création)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS date_expiration_token TIMESTAMP;

-- Index pour recherche rapide par token
CREATE INDEX IF NOT EXISTS idx_utilisateurs_token_verification ON utilisateurs(token_verification_email);

-- Les utilisateurs existants sont considérés comme vérifiés (migration rétroactive)
UPDATE utilisateurs SET email_verifie = TRUE WHERE email_verifie = FALSE;

-- Commentaires sur les colonnes
COMMENT ON COLUMN utilisateurs.email_verifie IS 'Indique si l''email a été vérifié par l''utilisateur';
COMMENT ON COLUMN utilisateurs.token_verification_email IS 'Token unique envoyé par email pour validation';
COMMENT ON COLUMN utilisateurs.date_expiration_token IS 'Date d''expiration du token de vérification (72h)';
