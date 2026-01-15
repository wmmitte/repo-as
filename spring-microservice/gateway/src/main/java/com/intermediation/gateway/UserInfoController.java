package com.intermediation.gateway;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * Contrôleur pour les informations de l'utilisateur connecté
 * Endpoints accessibles depuis le frontend pour récupérer les rôles et permissions
 */
@RestController
@RequestMapping("/api/me")
public class UserInfoController {

    /**
     * Récupérer les rôles de l'utilisateur connecté
     * Endpoint utilisé par le frontend pour vérifier les permissions
     */
    @GetMapping("/roles")
    public Mono<ResponseEntity<Map<String, Object>>> getUserRoles(@AuthenticationPrincipal Mono<OidcUser> principalMono) {
        return principalMono
                .flatMap(principal -> {
                    if (principal == null) {
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Non authentifié");
                        return Mono.just(ResponseEntity.status(401).body(errorResponse));
                    }

                    try {
                        // Extraire les rôles depuis le token JWT
                        List<String> roles = new ArrayList<>();

                        // DEBUG: Afficher tous les claims du token
                        System.out.println("🔍 [USER INFO] ===== DEBUG: Tous les claims du token JWT =====");
                        principal.getClaims().forEach((key, value) -> {
                            System.out.println("  [CLAIM] " + key + " = " + value);
                        });
                        System.out.println("🔍 [USER INFO] ================================================");

                        // Rôles depuis resource_access.pitm-auth-service.roles
                        Object resourceAccess = principal.getClaim("resource_access");
                        System.out.println("🔍 [USER INFO] resource_access = " + resourceAccess);
                        if (resourceAccess instanceof Map) {
                            Object clientResource = ((Map<?, ?>) resourceAccess).get("pitm-auth-service");
                            if (clientResource instanceof Map) {
                                Object clientRoles = ((Map<?, ?>) clientResource).get("roles");
                                if (clientRoles instanceof List) {
                                    ((List<?>) clientRoles).forEach(role -> {
                                        if (role instanceof String) {
                                            roles.add((String) role);
                                        }
                                    });
                                }
                            }
                        }

                        // Rôles depuis realm_access.roles
                        Object realmAccess = principal.getClaim("realm_access");
                        System.out.println("🔍 [USER INFO] realm_access = " + realmAccess);
                        if (realmAccess instanceof Map) {
                            Object realmRoles = ((Map<?, ?>) realmAccess).get("roles");
                            if (realmRoles instanceof List) {
                                ((List<?>) realmRoles).forEach(role -> {
                                    if (role instanceof String && !((String) role).startsWith("default-")
                                        && !((String) role).startsWith("offline_")
                                        && !role.equals("uma_authorization")) {
                                        if (!roles.contains((String) role)) {
                                            roles.add((String) role);
                                        }
                                    }
                                });
                            }
                        }

                        Map<String, Object> response = new HashMap<>();
                        response.put("roles", roles);
                        response.put("email", principal.getEmail());

                        System.out.println("🔑 [USER INFO] Rôles utilisateur " + principal.getEmail() + ": " + roles);

                        return Mono.just(ResponseEntity.ok(response));

                    } catch (Exception e) {
                        System.err.println("❌ [USER INFO] Erreur lors de la récupération des rôles: " + e.getMessage());
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Erreur lors de la récupération des rôles");
                        return Mono.just(ResponseEntity.status(500).body(errorResponse));
                    }
                })
                .switchIfEmpty(Mono.defer(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Non authentifié");
                    return Mono.just(ResponseEntity.status(401).body(errorResponse));
                }));
    }
}
