# Script pour verifier les roles et groupes d'un utilisateur dans Keycloak

# 1. Obtenir le token admin
$tokenResponse = Invoke-RestMethod -Uri "http://localhost:8098/realms/master/protocol/openid-connect/token" `
    -Method Post `
    -Body @{
        grant_type='password'
        client_id='admin-cli'
        username='admin'
        password='admin'
    } `
    -ContentType 'application/x-www-form-urlencoded'

$token = $tokenResponse.access_token
Write-Host "[OK] Token obtenu" -ForegroundColor Green

# 2. Rechercher l'utilisateur par email
$email = "anptic.gov.bf@gmail.com"
Write-Host ""
Write-Host "[INFO] Recherche de l'utilisateur: $email" -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $token"
}

$users = Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/realm_picp/users?email=$email&exact=true" `
    -Headers $headers `
    -Method Get

if ($users.Count -eq 0) {
    Write-Host "[ERREUR] Utilisateur non trouve" -ForegroundColor Red
    exit
}

$user = $users[0]
$userId = $user.id

Write-Host ""
Write-Host "[OK] Utilisateur trouve:" -ForegroundColor Green
Write-Host "   - ID: $userId"
Write-Host "   - Username: $($user.username)"
Write-Host "   - Email: $($user.email)"
Write-Host "   - Nom: $($user.firstName) $($user.lastName)"
Write-Host "   - Email verifie: $($user.emailVerified)"
Write-Host "   - Enabled: $($user.enabled)"

# 3. Recuperer les roles realm (composites)
Write-Host ""
Write-Host "[INFO] Roles Realm (effectifs):" -ForegroundColor Cyan
try {
    $roles = Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/realm_picp/users/$userId/role-mappings/realm/composite" `
        -Headers $headers `
        -Method Get

    foreach ($role in $roles) {
        if ($role.name -notlike 'default-*' -and
            $role.name -notlike 'offline_*' -and
            $role.name -ne 'uma_authorization') {
            Write-Host "   - $($role.name)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   [WARN] Erreur recuperation roles: $_" -ForegroundColor Red
}

# 4. Recuperer les groupes
Write-Host ""
Write-Host "[INFO] Groupes:" -ForegroundColor Cyan
try {
    $groups = Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/realm_picp/users/$userId/groups" `
        -Headers $headers `
        -Method Get

    if ($groups.Count -eq 0) {
        Write-Host "   (aucun groupe)" -ForegroundColor Gray
    } else {
        foreach ($group in $groups) {
            Write-Host "   - $($group.name) (ID: $($group.id))" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   [WARN] Erreur recuperation groupes: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "[OK] Verification terminee" -ForegroundColor Green
Write-Host ""
