# Script pour décoder un JWT et voir son contenu
# Utile pour vérifier si les rôles sont bien dans le token

Write-Host "🔍 ========================================" -ForegroundColor Cyan
Write-Host "🔍 Décodage du JWT Keycloak" -ForegroundColor Cyan
Write-Host "🔍 ========================================" -ForegroundColor Cyan
Write-Host ""

# Demander le JWT à l'utilisateur
Write-Host "[INFO] Pour obtenir votre JWT:" -ForegroundColor Yellow
Write-Host "  1. Connectez-vous sur le frontend (http://localhost:8090)" -ForegroundColor White
Write-Host "  2. Ouvrez les DevTools (F12) → onglet Application/Storage" -ForegroundColor White
Write-Host "  3. Dans 'Session Storage' → http://localhost:8090" -ForegroundColor White
Write-Host "  4. Cherchez une clé qui contient 'token' ou 'jwt'" -ForegroundColor White
Write-Host "  5. OU dans 'Cookies' cherchez un cookie de session" -ForegroundColor White
Write-Host ""
Write-Host "  ALTERNATIVE: Ouvrez Network → F5 pour rafraîchir → trouvez la requête /api/me" -ForegroundColor White
Write-Host "  → Dans l'onglet Headers → Request Headers → cherchez 'Authorization: Bearer ...'" -ForegroundColor White
Write-Host ""

$jwt = Read-Host "Collez votre JWT ici (ou tapez ENTER pour tester avec un utilisateur)"

if ($jwt -eq "" -or $jwt -eq $null) {
    Write-Host ""
    Write-Host "[INFO] Test avec authentification directe..." -ForegroundColor Yellow
    Write-Host ""

    $email = Read-Host "Email de l'utilisateur"
    $password = Read-Host "Mot de passe" -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

    Write-Host ""
    Write-Host "[INFO] Tentative de connexion..." -ForegroundColor Yellow

    try {
        # Se connecter via Keycloak directement
        $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8098/realms/realm_picp/protocol/openid-connect/token" `
            -Method Post `
            -Body @{
                grant_type='password'
                client_id='pitm-auth-service'
                username=$email
                password=$passwordPlain
                scope='openid profile email'
            } `
            -ContentType 'application/x-www-form-urlencoded'

        $jwt = $tokenResponse.id_token
        Write-Host "[OK] Token obtenu avec succès" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[ERREUR] Impossible de se connecter: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "[INFO] Cela peut signifier:" -ForegroundColor Yellow
        Write-Host "  - L'utilisateur n'a pas de mot de passe (authentification OAuth uniquement)" -ForegroundColor Yellow
        Write-Host "  - Le mot de passe est incorrect" -ForegroundColor Yellow
        Write-Host "  - L'email n'est pas vérifié" -ForegroundColor Yellow
        exit
    }
}

# Fonction pour décoder Base64URL
function Decode-Base64Url {
    param([string]$input)

    $output = $input.Replace('-', '+').Replace('_', '/')

    # Ajouter le padding si nécessaire
    switch ($output.Length % 4) {
        2 { $output += '==' }
        3 { $output += '=' }
    }

    $bytes = [System.Convert]::FromBase64String($output)
    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

# Décoder le JWT
Write-Host "[INFO] Décodage du JWT..." -ForegroundColor Yellow
Write-Host ""

try {
    $parts = $jwt.Split('.')

    if ($parts.Length -ne 3) {
        Write-Host "[ERREUR] Format JWT invalide (devrait avoir 3 parties séparées par des points)" -ForegroundColor Red
        exit
    }

    # Décoder le header
    $headerJson = Decode-Base64Url $parts[0]
    $header = $headerJson | ConvertFrom-Json

    # Décoder le payload
    $payloadJson = Decode-Base64Url $parts[1]
    $payload = $payloadJson | ConvertFrom-Json

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "HEADER DU JWT" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ($header | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "PAYLOAD DU JWT (CLAIMS)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Afficher les infos importantes
    Write-Host "Utilisateur:" -ForegroundColor Yellow
    Write-Host "  - Email: $($payload.email)" -ForegroundColor White
    Write-Host "  - Nom: $($payload.name)" -ForegroundColor White
    Write-Host "  - Subject (ID): $($payload.sub)" -ForegroundColor White
    Write-Host ""

    Write-Host "Token Info:" -ForegroundColor Yellow
    Write-Host "  - Issuer: $($payload.iss)" -ForegroundColor White
    Write-Host "  - Audience: $($payload.aud)" -ForegroundColor White
    Write-Host "  - Expires: $([DateTimeOffset]::FromUnixTimeSeconds($payload.exp).LocalDateTime)" -ForegroundColor White
    Write-Host ""

    # VÉRIFIER LES RÔLES
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "VÉRIFICATION DES RÔLES" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    $rolesFound = $false

    # Vérifier realm_access.roles
    if ($payload.realm_access -and $payload.realm_access.roles) {
        Write-Host "✅ realm_access.roles TROUVÉ:" -ForegroundColor Green
        foreach ($role in $payload.realm_access.roles) {
            Write-Host "  - $role" -ForegroundColor White
        }
        $rolesFound = $true
        Write-Host ""
    } else {
        Write-Host "❌ realm_access.roles ABSENT du JWT" -ForegroundColor Red
        Write-Host ""
    }

    # Vérifier resource_access
    if ($payload.resource_access) {
        Write-Host "✅ resource_access TROUVÉ:" -ForegroundColor Green
        $payload.resource_access | Get-Member -MemberType NoteProperty | ForEach-Object {
            $clientName = $_.Name
            $clientRoles = $payload.resource_access.$clientName.roles
            if ($clientRoles) {
                Write-Host "  Client '$clientName':" -ForegroundColor Yellow
                foreach ($role in $clientRoles) {
                    Write-Host "    - $role" -ForegroundColor White
                }
                $rolesFound = $true
            }
        }
        Write-Host ""
    } else {
        Write-Host "❌ resource_access ABSENT du JWT" -ForegroundColor Red
        Write-Host ""
    }

    if (-not $rolesFound) {
        Write-Host "⚠️  ========================================" -ForegroundColor Red
        Write-Host "⚠️  PROBLÈME IDENTIFIÉ" -ForegroundColor Red
        Write-Host "⚠️  ========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Le JWT ne contient AUCUN rôle." -ForegroundColor Red
        Write-Host "C'est pour ça que les menus ne s'affichent pas." -ForegroundColor Red
        Write-Host ""
        Write-Host "Solutions:" -ForegroundColor Yellow
        Write-Host "  1. Exécutez: fix-keycloak-roles-in-jwt.ps1" -ForegroundColor White
        Write-Host "  2. Déconnectez-vous et reconnectez-vous pour obtenir un nouveau JWT" -ForegroundColor White
        Write-Host "  3. Vérifiez que les Protocol Mappers sont bien configurés dans Keycloak" -ForegroundColor White
        Write-Host ""
    }

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "PAYLOAD COMPLET (JSON)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ($payload | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "[ERREUR] Impossible de décoder le JWT: $_" -ForegroundColor Red
    exit
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Décodage terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
