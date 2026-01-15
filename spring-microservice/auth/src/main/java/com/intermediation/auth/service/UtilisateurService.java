package com.intermediation.auth.service;

import com.intermediation.auth.dto.UtilisateurDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour gérer les utilisateurs via Keycloak
 */
@Service
public class UtilisateurService {

    private static final Logger logger = LoggerFactory.getLogger(UtilisateurService.class);

    @Value("${keycloak.admin.url:http://localhost:8098}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:realm_picp}")
    private String realm;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    private final RestTemplate restTemplate;

    public UtilisateurService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Récupérer les utilisateurs ayant un rôle spécifique (incluant ceux qui héritent via un groupe)
     * Stratégie: chercher d'abord un groupe portant le nom du rôle
     */
    public List<UtilisateurDTO> getUtilisateursByRole(String roleName) {
        logger.info("Récupération des utilisateurs avec le rôle: {}", roleName);

        try {
            // 1. Obtenir un token admin
            String adminToken = getAdminToken();

            // 2. Essayer de récupérer les utilisateurs du groupe portant le nom du rôle
            List<UtilisateurDTO> utilisateurs = getUsersByGroupName(roleName, adminToken);

            if (!utilisateurs.isEmpty()) {
                logger.info("✅ {} utilisateurs trouvés dans le groupe '{}'", utilisateurs.size(), roleName);
                return utilisateurs;
            }

            // 3. Si aucun groupe trouvé, essayer par rôle direct
            logger.info("Aucun groupe '{}' trouvé, recherche par rôle direct...", roleName);
            utilisateurs = getUsersByDirectRole(roleName, adminToken);

            logger.info("✅ {} utilisateurs trouvés avec le rôle direct '{}'", utilisateurs.size(), roleName);
            return utilisateurs;

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des utilisateurs par rôle: {}", e.getMessage(), e);
        }

        return new ArrayList<>();
    }

    /**
     * Récupérer un utilisateur par son ID Keycloak
     */
    public UtilisateurDTO getUtilisateurById(String userId) {
        logger.info("Récupération de l'utilisateur avec ID: {}", userId);

        try {
            // 1. Obtenir un token admin
            String adminToken = getAdminToken();

            // 2. Récupérer l'utilisateur par son ID
            String url = String.format("%s/admin/realms/%s/users/%s",
                    keycloakServerUrl, realm, userId);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getBody() != null) {
                UtilisateurDTO utilisateur = mapToUtilisateurDTO(response.getBody());
                logger.info("✅ Utilisateur trouvé: {}", utilisateur.getEmail());
                return utilisateur;
            }

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération de l'utilisateur {}: {}", userId, e.getMessage(), e);
        }

        return null;
    }

    /**
     * Récupérer les utilisateurs par nom de groupe
     */
    private List<UtilisateurDTO> getUsersByGroupName(String groupName, String adminToken) {
        try {
            // 1. Récupérer l'ID du groupe
            String groupId = getGroupIdByName(groupName, adminToken);
            if (groupId == null) {
                logger.info("Groupe '{}' non trouvé dans Keycloak", groupName);
                return new ArrayList<>();
            }

            // 2. Récupérer les membres du groupe
            String url = String.format("%s/admin/realms/%s/groups/%s/members",
                    keycloakServerUrl, realm, groupId);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() != null) {
                return response.getBody().stream()
                        .map(this::mapToUtilisateurDTO)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            logger.warn("Erreur lors de la récupération des utilisateurs du groupe '{}': {}", groupName, e.getMessage());
        }

        return new ArrayList<>();
    }

    /**
     * Récupérer les utilisateurs par rôle direct (sans héritage de groupe)
     */
    private List<UtilisateurDTO> getUsersByDirectRole(String roleName, String adminToken) {
        try {
            // 1. Récupérer l'ID du rôle
            String roleId = getRoleId(roleName, adminToken);
            if (roleId == null) {
                logger.warn("Rôle '{}' non trouvé dans Keycloak", roleName);
                return new ArrayList<>();
            }

            // 2. Récupérer les utilisateurs ayant ce rôle directement
            String url = String.format("%s/admin/realms/%s/roles-by-id/%s/users",
                    keycloakServerUrl, realm, roleId);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() != null) {
                return response.getBody().stream()
                        .map(this::mapToUtilisateurDTO)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            logger.warn("Erreur lors de la récupération des utilisateurs par rôle direct '{}': {}", roleName, e.getMessage());
        }

        return new ArrayList<>();
    }

    /**
     * Récupérer l'ID d'un groupe par son nom
     */
    private String getGroupIdByName(String groupName, String adminToken) {
        String url = String.format("%s/admin/realms/%s/groups?search=%s",
                keycloakServerUrl, realm, groupName);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() != null && !response.getBody().isEmpty()) {
                // Chercher le groupe avec le nom exact
                for (Map<String, Object> group : response.getBody()) {
                    String name = (String) group.get("name");
                    if (groupName.equalsIgnoreCase(name)) {
                        return (String) group.get("id");
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de l'ID du groupe '{}': {}", groupName, e.getMessage());
        }

        return null;
    }

    /**
     * Obtenir un token admin pour accéder à l'API Admin de Keycloak
     * Utilise le client admin-cli avec username/password
     */
    private String getAdminToken() {
        // Pour admin-cli, on utilise le realm master
        String tokenUrl = String.format("%s/realms/master/protocol/openid-connect/token",
                keycloakServerUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = String.format(
                "grant_type=password&client_id=admin-cli&username=%s&password=%s",
                adminUsername, adminPassword
        );

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("access_token")) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            logger.error("Erreur lors de l'obtention du token admin: {}", e.getMessage());
            throw new RuntimeException("Impossible d'obtenir le token admin Keycloak", e);
        }

        throw new RuntimeException("Token admin non disponible");
    }

    /**
     * Récupérer l'ID d'un rôle par son nom
     */
    private String getRoleId(String roleName, String adminToken) {
        String url = String.format("%s/admin/realms/%s/roles/%s",
                keycloakServerUrl, realm, roleName);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getBody() != null && response.getBody().containsKey("id")) {
                return (String) response.getBody().get("id");
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de l'ID du rôle '{}': {}", roleName, e.getMessage());
        }

        return null;
    }

    /**
     * Mapper les données Keycloak vers UtilisateurDTO
     */
    private UtilisateurDTO mapToUtilisateurDTO(Map<String, Object> keycloakUser) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId((String) keycloakUser.get("id"));
        dto.setUsername((String) keycloakUser.get("username"));
        dto.setEmail((String) keycloakUser.get("email"));
        dto.setEnabled((Boolean) keycloakUser.getOrDefault("enabled", false));

        // Extraire nom et prénom des attributs si disponibles
        if (keycloakUser.containsKey("firstName")) {
            dto.setPrenom((String) keycloakUser.get("firstName"));
        }
        if (keycloakUser.containsKey("lastName")) {
            dto.setNom((String) keycloakUser.get("lastName"));
        }

        // Si pas de nom/prenom, utiliser l'email
        if (dto.getNom() == null || dto.getNom().isEmpty()) {
            String email = dto.getEmail();
            if (email != null && email.contains("@")) {
                dto.setNom(email.substring(0, email.indexOf("@")));
            }
        }

        return dto;
    }
}
