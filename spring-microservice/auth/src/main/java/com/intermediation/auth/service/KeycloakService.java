package com.intermediation.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service pour interagir avec l'API Admin de Keycloak
 * Gère la création d'utilisateurs et l'attribution de mots de passe
 */
@Service
public class KeycloakService {

    @Value("${keycloak.admin.url:http://localhost:8098}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:realm_picp}")
    private String realm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String adminClientId;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    private final RestTemplate restTemplate;

    public KeycloakService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Obtenir un token d'accès admin pour Keycloak
     */
    private String getAdminAccessToken() {
        String tokenUrl = keycloakServerUrl + "/realms/master/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = String.format(
            "grant_type=password&client_id=%s&username=%s&password=%s",
            adminClientId, adminUsername, adminPassword
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("access_token")) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de l'obtention du token admin: " + e.getMessage());
        }

        return null;
    }

    /**
     * Créer un utilisateur dans Keycloak avec email et mot de passe
     * @return L'ID de l'utilisateur créé dans Keycloak, ou null en cas d'erreur
     */
    public String createUser(String email, String prenom, String nom, String motDePasse) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return null;
        }

        String createUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // Créer le payload pour l'utilisateur
        Map<String, Object> userRepresentation = new HashMap<>();
        userRepresentation.put("username", email);
        userRepresentation.put("email", email);
        userRepresentation.put("firstName", prenom);
        userRepresentation.put("lastName", nom);
        userRepresentation.put("enabled", true);
        userRepresentation.put("emailVerified", false); // L'email doit être vérifié via notre système

        // Définir le mot de passe
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", motDePasse);
        credential.put("temporary", false); // Le mot de passe n'est pas temporaire

        userRepresentation.put("credentials", Collections.singletonList(credential));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userRepresentation, headers);

        try {
            System.out.println("📤 [KEYCLOAK] Création de l'utilisateur: " + email);
            ResponseEntity<String> response = restTemplate.postForEntity(createUserUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                // Récupérer l'ID de l'utilisateur depuis le header Location
                String location = response.getHeaders().getFirst("Location");
                if (location != null) {
                    String userId = location.substring(location.lastIndexOf('/') + 1);
                    System.out.println("✅ [KEYCLOAK] Utilisateur créé avec succès. ID: " + userId);
                    return userId;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la création de l'utilisateur: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Vérifier si un utilisateur existe dans Keycloak par email
     */
    public boolean userExists(String email) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            return false;
        }

        String searchUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users?email=" + email + "&exact=true";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(searchUserUrl, HttpMethod.GET, request, List.class);
            return response.getBody() != null && !response.getBody().isEmpty();
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la recherche d'utilisateur: " + e.getMessage());
            return false;
        }
    }

    /**
     * Vérifier les credentials d'un utilisateur (email + mot de passe)
     * @return true si les credentials sont valides
     */
    public boolean validateCredentials(String email, String password) {
        String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = String.format(
            "grant_type=password&client_id=pitm-auth-service&username=%s&password=%s",
            email, password
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            return response.getStatusCode() == HttpStatus.OK && response.getBody() != null;
        } catch (Exception e) {
            System.out.println("⚠️ [KEYCLOAK] Validation échouée pour: " + email);
            return false;
        }
    }

    /**
     * Récupérer l'ID Keycloak d'un utilisateur par son email
     * @return L'ID de l'utilisateur dans Keycloak, ou null si non trouvé
     */
    public String getUserIdByEmail(String email) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            return null;
        }

        String searchUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users?email=" + email + "&exact=true";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(searchUserUrl, HttpMethod.GET, request, List.class);
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> user = (Map<String, Object>) response.getBody().get(0);
                return (String) user.get("id");
            }
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la recherche d'utilisateur: " + e.getMessage());
        }

        return null;
    }

    /**
     * Mettre à jour le statut emailVerified d'un utilisateur dans Keycloak
     * @return true si la mise à jour a réussi
     */
    public boolean mettreAJourEmailVerifie(String email, boolean emailVerifie) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("[KEYCLOAK] Impossible d'obtenir le token admin");
            return false;
        }

        // Récupérer l'ID de l'utilisateur
        String userId = getUserIdByEmail(email);
        if (userId == null) {
            System.err.println("[KEYCLOAK] Utilisateur non trouvé: " + email);
            return false;
        }

        String updateUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("emailVerified", emailVerifie);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(updatePayload, headers);

        try {
            System.out.println("[KEYCLOAK] Mise à jour emailVerified=" + emailVerifie + " pour: " + email);
            ResponseEntity<String> response = restTemplate.exchange(
                updateUserUrl,
                HttpMethod.PUT,
                request,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                System.out.println("[KEYCLOAK] emailVerified mis à jour avec succès pour: " + email);
                return true;
            }
        } catch (Exception e) {
            System.err.println("[KEYCLOAK] Erreur lors de la mise à jour emailVerified: " + e.getMessage());
        }

        return false;
    }

    /**
     * Changer le mot de passe d'un utilisateur dans Keycloak
     * @return true si le changement a réussi
     */
    public boolean changerMotDePasse(String email, String nouveauMotDePasse) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return false;
        }

        // Récupérer l'ID de l'utilisateur
        String userId = getUserIdByEmail(email);
        if (userId == null) {
            System.err.println("❌ [KEYCLOAK] Utilisateur non trouvé: " + email);
            return false;
        }

        String resetPasswordUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId + "/reset-password";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // Créer le payload pour le nouveau mot de passe
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", nouveauMotDePasse);
        credential.put("temporary", false);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(credential, headers);

        try {
            System.out.println("🔐 [KEYCLOAK] Changement de mot de passe pour: " + email);
            ResponseEntity<String> response = restTemplate.exchange(
                resetPasswordUrl,
                HttpMethod.PUT,
                request,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                System.out.println("✅ [KEYCLOAK] Mot de passe changé avec succès pour: " + email);
                return true;
            }
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors du changement de mot de passe: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Récupérer les rôles d'un utilisateur depuis Keycloak
     * @param keycloakUserId L'ID de l'utilisateur dans Keycloak
     * @return Liste des rôles de l'utilisateur
     */
    public List<String> obtenirRolesUtilisateur(String keycloakUserId) {
        List<String> roles = new ArrayList<>();

        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            System.err.println("⚠️ [KEYCLOAK] keycloakUserId null ou vide");
            return roles;
        }

        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return roles;
        }

        // Récupérer les rôles realm EFFECTIFS de l'utilisateur (incluant ceux des groupes)
        // L'endpoint /composite retourne tous les rôles effectifs (directs + hérités des groupes)
        String realmRolesUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId + "/role-mappings/realm/composite";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(realmRolesUrl, HttpMethod.GET, request, List.class);
            if (response.getBody() != null) {
                for (Object roleObj : response.getBody()) {
                    if (roleObj instanceof Map) {
                        Map<String, Object> role = (Map<String, Object>) roleObj;
                        String roleName = (String) role.get("name");
                        if (roleName != null && !roleName.startsWith("default-")
                            && !roleName.startsWith("offline_")
                            && !roleName.equals("uma_authorization")) {
                            roles.add(roleName);
                        }
                    }
                }
            }
            System.out.println("🔑 [KEYCLOAK] Rôles effectifs (directs + groupes) pour l'utilisateur " + keycloakUserId + ": " + roles);
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la récupération des rôles: " + e.getMessage());
        }

        return roles;
    }

    /**
     * Récupère le Keycloak ID d'un utilisateur par son email
     * Utilisé pour mapper les utilisateurs Email/Password vers Keycloak
     */
    public String getKeycloakIdByEmail(String email) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return null;
        }

        try {
            // Rechercher l'utilisateur par email via l'API Keycloak
            String searchUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users?email=" + email.toLowerCase();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(searchUrl, HttpMethod.GET, request, List.class);

            if (response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> user = (Map<String, Object>) response.getBody().get(0);
                String keycloakId = (String) user.get("id");

                System.out.println("✅ [KEYCLOAK] ID trouvé pour email " + email + ": " + keycloakId);
                return keycloakId;
            }

            System.err.println("⚠️  [KEYCLOAK] Aucun utilisateur trouvé pour l'email: " + email);
            return null;

        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la recherche Keycloak ID: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Attribuer des rôles realm à un utilisateur
     * @param keycloakUserId ID de l'utilisateur dans Keycloak
     * @param roles Liste des noms de rôles à attribuer
     * @return true si l'attribution a réussi
     */
    public boolean attribuerRoles(String keycloakUserId, List<String> roles) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return false;
        }

        try {
            // Récupérer les rôles disponibles dans le realm
            String rolesDisponiblesUrl = keycloakServerUrl + "/admin/realms/" + realm + "/roles";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> requestRoles = new HttpEntity<>(headers);

            ResponseEntity<List> responseRoles = restTemplate.exchange(
                rolesDisponiblesUrl,
                HttpMethod.GET,
                requestRoles,
                List.class
            );

            if (responseRoles.getBody() == null) {
                System.err.println("❌ [KEYCLOAK] Impossible de récupérer les rôles disponibles");
                return false;
            }

            // Construire la liste des rôles à attribuer
            List<Map<String, Object>> rolesAAttribuer = new ArrayList<>();
            for (Object roleObj : responseRoles.getBody()) {
                Map<String, Object> role = (Map<String, Object>) roleObj;
                String roleName = (String) role.get("name");

                if (roles.contains(roleName)) {
                    Map<String, Object> roleToAdd = new HashMap<>();
                    roleToAdd.put("id", role.get("id"));
                    roleToAdd.put("name", roleName);
                    rolesAAttribuer.add(roleToAdd);
                }
            }

            if (rolesAAttribuer.isEmpty()) {
                System.err.println("❌ [KEYCLOAK] Aucun rôle valide trouvé dans la liste: " + roles);
                return false;
            }

            // Attribuer les rôles
            String attribuerRolesUrl = keycloakServerUrl + "/admin/realms/" + realm +
                "/users/" + keycloakUserId + "/role-mappings/realm";

            HttpHeaders headersAttribution = new HttpHeaders();
            headersAttribution.setContentType(MediaType.APPLICATION_JSON);
            headersAttribution.setBearerAuth(accessToken);

            HttpEntity<List<Map<String, Object>>> requestAttribution =
                new HttpEntity<>(rolesAAttribuer, headersAttribution);

            ResponseEntity<String> responseAttribution = restTemplate.exchange(
                attribuerRolesUrl,
                HttpMethod.POST,
                requestAttribution,
                String.class
            );

            if (responseAttribution.getStatusCode() == HttpStatus.NO_CONTENT) {
                System.out.println("✅ [KEYCLOAK] Rôles attribués avec succès: " + roles);
                return true;
            }

        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de l'attribution des rôles: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Récupérer l'ID d'un groupe par son nom
     * @param nomGroupe Nom du groupe
     * @return ID du groupe, ou null si non trouvé
     */
    private String obtenirIdGroupe(String nomGroupe) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            return null;
        }

        try {
            String groupesUrl = keycloakServerUrl + "/admin/realms/" + realm + "/groups?search=" + nomGroupe;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(groupesUrl, HttpMethod.GET, request, List.class);

            if (response.getBody() != null && !response.getBody().isEmpty()) {
                for (Object groupeObj : response.getBody()) {
                    Map<String, Object> groupe = (Map<String, Object>) groupeObj;
                    String nom = (String) groupe.get("name");
                    if (nomGroupe.equals(nom)) {
                        return (String) groupe.get("id");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors de la recherche du groupe " + nomGroupe + ": " + e.getMessage());
        }

        return null;
    }

    /**
     * Attribuer des groupes à un utilisateur
     * @param keycloakUserId ID de l'utilisateur dans Keycloak
     * @param groupes Liste des noms de groupes à attribuer
     * @return true si l'attribution a réussi pour tous les groupes
     */
    public boolean attribuerGroupes(String keycloakUserId, List<String> groupes) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return false;
        }

        boolean tousReussis = true;

        for (String nomGroupe : groupes) {
            try {
                // Récupérer l'ID du groupe
                String groupeId = obtenirIdGroupe(nomGroupe);
                if (groupeId == null) {
                    System.err.println("❌ [KEYCLOAK] Groupe introuvable: " + nomGroupe);
                    tousReussis = false;
                    continue;
                }

                // Ajouter l'utilisateur au groupe
                String ajouterGroupeUrl = keycloakServerUrl + "/admin/realms/" + realm +
                    "/users/" + keycloakUserId + "/groups/" + groupeId;

                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(accessToken);
                HttpEntity<Void> request = new HttpEntity<>(headers);

                ResponseEntity<String> response = restTemplate.exchange(
                    ajouterGroupeUrl,
                    HttpMethod.PUT,
                    request,
                    String.class
                );

                if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                    System.out.println("✅ [KEYCLOAK] Utilisateur ajouté au groupe: " + nomGroupe);
                } else {
                    System.err.println("❌ [KEYCLOAK] Échec de l'ajout au groupe: " + nomGroupe);
                    tousReussis = false;
                }

            } catch (Exception e) {
                System.err.println("❌ [KEYCLOAK] Erreur lors de l'ajout au groupe " + nomGroupe + ": " + e.getMessage());
                tousReussis = false;
            }
        }

        return tousReussis;
    }

    /**
     * Retirer un utilisateur d'un groupe
     * @param keycloakUserId ID de l'utilisateur dans Keycloak
     * @param nomGroupe Nom du groupe à retirer
     * @return true si le retrait a réussi
     */
    public boolean retirerGroupe(String keycloakUserId, String nomGroupe) {
        String accessToken = getAdminAccessToken();
        if (accessToken == null) {
            System.err.println("❌ [KEYCLOAK] Impossible d'obtenir le token admin");
            return false;
        }

        try {
            // Récupérer l'ID du groupe
            String groupeId = obtenirIdGroupe(nomGroupe);
            if (groupeId == null) {
                System.out.println("ℹ️  [KEYCLOAK] Groupe introuvable (peut-être déjà retiré): " + nomGroupe);
                return true; // Considéré comme succès si le groupe n'existe pas
            }

            // Retirer l'utilisateur du groupe
            String retirerGroupeUrl = keycloakServerUrl + "/admin/realms/" + realm +
                "/users/" + keycloakUserId + "/groups/" + groupeId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                retirerGroupeUrl,
                HttpMethod.DELETE,
                request,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                System.out.println("✅ [KEYCLOAK] Utilisateur retiré du groupe: " + nomGroupe);
                return true;
            } else {
                System.err.println("❌ [KEYCLOAK] Échec du retrait du groupe: " + nomGroupe);
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ [KEYCLOAK] Erreur lors du retrait du groupe " + nomGroupe + ": " + e.getMessage());
            return false;
        }
    }
}
