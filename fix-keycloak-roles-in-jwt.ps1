# Script pour vérifier et ajouter les mappers de rôles dans le JWT Keycloak
# Les rôles doivent être présents dans le JWT pour que le Gateway puisse les extraire

Write-Host "🔧 ========================================" -ForegroundColor Cyan
Write-Host "🔧 Configuration des mappers de rôles JWT" -ForegroundColor Cyan
Write-Host "🔧 ========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Obtenir le token admin
Write-Host "[ÉTAPE 1] Connexion à Keycloak..." -ForegroundColor Yellow
try {
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
    Write-Host "[OK] Token admin obtenu" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERREUR] Impossible d'obtenir le token admin: $_" -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$realm = "realm_picp"
$clientId = "pitm-auth-service"

# 2. Récupérer l'ID du client
Write-Host "[ÉTAPE 2] Récupération du client '$clientId'..." -ForegroundColor Yellow
try {
    $clients = Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/$realm/clients?clientId=$clientId" `
        -Headers $headers `
        -Method Get

    if ($clients.Count -eq 0) {
        Write-Host "[ERREUR] Client '$clientId' non trouvé" -ForegroundColor Red
        exit
    }

    $client = $clients[0]
    $clientUuid = $client.id
    Write-Host "[OK] Client trouvé: $clientId (UUID: $clientUuid)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERREUR] Impossible de récupérer le client: $_" -ForegroundColor Red
    exit
}

# 3. Vérifier les mappers existants
Write-Host "[ÉTAPE 3] Vérification des mappers existants..." -ForegroundColor Yellow
try {
    $mappers = Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/$realm/clients/$clientUuid/protocol-mappers/models" `
        -Headers $headers `
        -Method Get

    Write-Host "[INFO] Mappers existants:" -ForegroundColor Cyan
    $hasRealmRoles = $false
    $hasClientRoles = $false

    foreach ($mapper in $mappers) {
        Write-Host "  - $($mapper.name) ($($mapper.protocolMapper))" -ForegroundColor Gray

        if ($mapper.name -eq "realm roles" -or $mapper.name -eq "realm_roles") {
            $hasRealmRoles = $true
        }
        if ($mapper.name -eq "client roles" -or $mapper.name -eq "client_roles") {
            $hasClientRoles = $true
        }
    }
    Write-Host ""

    if ($hasRealmRoles) {
        Write-Host "[INFO] ✅ Mapper 'realm roles' existe déjà" -ForegroundColor Green
    } else {
        Write-Host "[INFO] ❌ Mapper 'realm roles' manquant" -ForegroundColor Yellow
    }

    if ($hasClientRoles) {
        Write-Host "[INFO] ✅ Mapper 'client roles' existe déjà" -ForegroundColor Green
    } else {
        Write-Host "[INFO] ❌ Mapper 'client roles' manquant" -ForegroundColor Yellow
    }
    Write-Host ""

} catch {
    Write-Host "[ERREUR] Impossible de récupérer les mappers: $_" -ForegroundColor Red
    exit
}

# 4. Créer le mapper pour realm_access (rôles realm)
if (-not $hasRealmRoles) {
    Write-Host "[ÉTAPE 4] Création du mapper 'realm roles'..." -ForegroundColor Yellow

    $realmRolesMapper = @{
        name = "realm roles"
        protocol = "openid-connect"
        protocolMapper = "oidc-usermodel-realm-role-mapper"
        config = @{
            "claim.name" = "realm_access.roles"
            "jsonType.label" = "String"
            "multivalued" = "true"
            "access.token.claim" = "true"
            "id.token.claim" = "true"
            "userinfo.token.claim" = "true"
        }
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/$realm/clients/$clientUuid/protocol-mappers/models" `
            -Headers $headers `
            -Method Post `
            -Body $realmRolesMapper `
            -ContentType 'application/json'

        Write-Host "[OK] ✅ Mapper 'realm roles' créé avec succès" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[ERREUR] Échec de la création du mapper 'realm roles': $_" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host "[ÉTAPE 4] Mapper 'realm roles' déjà présent, rien à faire" -ForegroundColor Green
    Write-Host ""
}

# 5. Créer le mapper pour resource_access (rôles client)
if (-not $hasClientRoles) {
    Write-Host "[ÉTAPE 5] Création du mapper 'client roles'..." -ForegroundColor Yellow

    $clientRolesMapper = @{
        name = "client roles"
        protocol = "openid-connect"
        protocolMapper = "oidc-usermodel-client-role-mapper"
        config = @{
            "claim.name" = "resource_access.${clientId}.roles"
            "jsonType.label" = "String"
            "multivalued" = "true"
            "access.token.claim" = "true"
            "id.token.claim" = "true"
            "userinfo.token.claim" = "true"
            "usermodel.clientRoleMapping.clientId" = $clientId
        }
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "http://localhost:8098/admin/realms/$realm/clients/$clientUuid/protocol-mappers/models" `
            -Headers $headers `
            -Method Post `
            -Body $clientRolesMapper `
            -ContentType 'application/json'

        Write-Host "[OK] ✅ Mapper 'client roles' créé avec succès" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[ERREUR] Échec de la création du mapper 'client roles': $_" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host "[ÉTAPE 5] Mapper 'client roles' déjà présent, rien à faire" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎉 ========================================" -ForegroundColor Green
Write-Host "🎉 Configuration terminée" -ForegroundColor Green
Write-Host "🎉 ========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] ⚠️  IMPORTANT: L'utilisateur doit se DÉCONNECTER et se RECONNECTER" -ForegroundColor Yellow
Write-Host "[INFO] pour que les nouveaux mappers soient appliqués au JWT." -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Étapes suivantes:" -ForegroundColor Cyan
Write-Host "  1. Déconnectez l'utilisateur anptic.gov.bf@gmail.com du frontend" -ForegroundColor White
Write-Host "  2. Reconnectez-vous avec Google OAuth" -ForegroundColor White
Write-Host "  3. Vérifiez que les menus Expert apparaissent maintenant" -ForegroundColor White
Write-Host ""
