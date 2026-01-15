# Script pour tester l'endpoint /api/me et vérifier les rôles renvoyés
# Ce script simule une connexion et vérifie les informations utilisateur

Write-Host "🔐 ========================================" -ForegroundColor Cyan
Write-Host "🔐 Test de l'endpoint /api/me" -ForegroundColor Cyan
Write-Host "🔐 ========================================" -ForegroundColor Cyan
Write-Host ""

# Credentials de l'utilisateur à tester
$email = "anptic.gov.bf@gmail.com"
$password = "Test@1234"  # À remplacer par le vrai mot de passe

Write-Host "[INFO] Test avec l'utilisateur: $email" -ForegroundColor Cyan
Write-Host ""

# 1. Se connecter via l'API /api/gateway/auth/login
Write-Host "[ÉTAPE 1] Connexion via /api/gateway/auth/login..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8090/api/gateway/auth/login" `
        -Method Post `
        -Body (@{
            email = $email
            password = $password
        } | ConvertTo-Json) `
        -ContentType 'application/json' `
        -SessionVariable session `
        -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json

    if ($loginData.success) {
        Write-Host "[OK] Connexion réussie" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[ERREUR] Échec de la connexion: $($loginData.message)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "[ERREUR] Impossible de se connecter: $_" -ForegroundColor Red
    Write-Host "[INFO] Assurez-vous que:" -ForegroundColor Yellow
    Write-Host "  1. Le Gateway est démarré sur le port 8090" -ForegroundColor Yellow
    Write-Host "  2. Le mot de passe est correct" -ForegroundColor Yellow
    Write-Host "  3. L'email de l'utilisateur est vérifié" -ForegroundColor Yellow
    exit
}

# 2. Appeler /api/me pour récupérer les informations utilisateur
Write-Host "[ÉTAPE 2] Récupération des informations via /api/me..." -ForegroundColor Yellow

try {
    $meResponse = Invoke-WebRequest -Uri "http://localhost:8090/api/me" `
        -Method Get `
        -WebSession $session `
        -ErrorAction Stop

    $meData = $meResponse.Content | ConvertFrom-Json

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "RÉPONSE DE /api/me" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "Authenticated: $($meData.authenticated)" -ForegroundColor Cyan
    Write-Host ""

    if ($meData.authenticated -and $meData.utilisateur) {
        $user = $meData.utilisateur

        Write-Host "Informations Utilisateur:" -ForegroundColor Yellow
        Write-Host "  - ID: $($user.id)" -ForegroundColor White
        Write-Host "  - Email: $($user.email)" -ForegroundColor White
        Write-Host "  - Nom: $($user.nom)" -ForegroundColor White
        Write-Host "  - Prénom: $($user.prenom)" -ForegroundColor White
        Write-Host "  - Actif: $($user.actif)" -ForegroundColor White
        Write-Host ""

        Write-Host "Rôles:" -ForegroundColor Yellow
        if ($user.roles -and $user.roles.Count -gt 0) {
            foreach ($role in $user.roles) {
                Write-Host "  ✅ $role" -ForegroundColor Green
            }
        } else {
            Write-Host "  ❌ AUCUN RÔLE RETOURNÉ" -ForegroundColor Red
            Write-Host "  ⚠️  C'EST LE PROBLÈME: Les rôles ne sont pas renvoyés par l'API" -ForegroundColor Red
        }
        Write-Host ""

        Write-Host "JSON Complet:" -ForegroundColor Yellow
        Write-Host ($meResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Gray

    } else {
        Write-Host "[ERREUR] Utilisateur non authentifié ou données manquantes" -ForegroundColor Red
    }

} catch {
    Write-Host "[ERREUR] Échec de la récupération des informations: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Si les rôles sont vides, vérifiez les logs du service Auth pour voir ce qui est extrait du JWT" -ForegroundColor Yellow
Write-Host ""
