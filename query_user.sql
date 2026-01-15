-- Requête pour voir les données de l'utilisateur abdramsanou@gmail.com
SELECT 
    id,
    email,
    nom,
    prenom,
    photo_url,
    google_id,
    facebook_id,
    apple_id,
    date_creation,
    derniere_connexion,
    actif
FROM utilisateurs
WHERE email LIKE '%wmyameogo%' OR email LIKE '%wmyameogo%';
