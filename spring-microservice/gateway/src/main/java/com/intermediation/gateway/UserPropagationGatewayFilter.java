package com.intermediation.gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Filtre global qui propage les informations de l'utilisateur authentifié
 * aux services backend via des headers HTTP
 */
@Component
public class UserPropagationGatewayFilter implements GlobalFilter, Ordered {

    private static final String HEADER_USER_EMAIL = "X-User-Email";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_NAME = "X-User-Name";
    private static final String HEADER_USER_GIVEN_NAME = "X-User-Given-Name";
    private static final String HEADER_USER_FAMILY_NAME = "X-User-Family-Name";
    private static final String HEADER_USER_PICTURE = "X-User-Picture";
    private static final String HEADER_USER_ROLES = "X-User-Roles";

    private final WebClient authWebClient;

    public UserPropagationGatewayFilter(WebClient.Builder webClientBuilder) {
        // Utiliser lb://AUTH pour la découverte de service via Eureka
        this.authWebClient = webClientBuilder.baseUrl("lb://AUTH").build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        System.out.println("🔍 [GATEWAY FILTER] Requête vers: " + path);
        
        // SÉCURITÉ: Le header X-User-Id doit TOUJOURS être déterminé par le backend
        // basé sur l'utilisateur authentifié, JAMAIS depuis le frontend
        // Supprimer tout header X-User-Id qui pourrait venir du frontend
        ServerWebExchange cleanedExchange = exchange.mutate()
            .request(builder -> builder.headers(headers -> headers.remove(HEADER_USER_ID)))
            .build();
        
        return ReactiveSecurityContextHolder.getContext()
            .doOnNext(ctx -> System.out.println("✅ [GATEWAY FILTER] SecurityContext trouvé"))
            .map(SecurityContext::getAuthentication)
            .doOnNext(auth -> System.out.println("🔍 [GATEWAY FILTER] Authentication: " + (auth != null ? auth.getClass().getSimpleName() : "null")))
            .filter(authentication -> {
                if (authentication == null) {
                    System.err.println("❌ [GATEWAY FILTER] Authentication est null");
                    return false;
                }
                if (!authentication.isAuthenticated()) {
                    System.err.println("❌ [GATEWAY FILTER] Utilisateur non authentifié");
                    return false;
                }
                return true;
            })
            .flatMap(authentication -> {
                // Vérifier que le principal est un OidcUser (OAuth2 ou Email/Password)
                if (!(authentication.getPrincipal() instanceof OidcUser)) {
                    System.err.println("❌ [GATEWAY FILTER] Type d'authentification non supporté: " +
                        (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null"));
                    return Mono.empty();
                }

                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

                // Déterminer le mode d'authentification pour les logs
                String authMode = authentication instanceof EmailPasswordAuthenticationToken ? "Email/Password" : "OAuth2";
                System.out.println("🔑 [GATEWAY FILTER] Mode " + authMode + " détecté");

                return handleAuthentication(oidcUser, cleanedExchange, chain);
            })
            .switchIfEmpty(Mono.defer(() -> {
                System.err.println("⚠️  [GATEWAY FILTER] Pas d'utilisateur authentifié pour: " + path);
                return chain.filter(cleanedExchange);
            }));
    }

    /**
     * Gère l'authentification (OAuth2/Keycloak ou Email/Password)
     * Les deux modes utilisent OidcUser comme principal
     */
    private Mono<Void> handleAuthentication(OidcUser oidcUser, ServerWebExchange cleanedExchange, GatewayFilterChain chain) {
        // Extraire les informations de l'utilisateur authentifié
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String givenName = oidcUser.getGivenName();
        String familyName = oidcUser.getFamilyName();
        String picture = oidcUser.getPicture();

        // Extraire les rôles depuis realm_access.roles
        String roles = null;
        Object realmAccess = oidcUser.getClaim("realm_access");
        if (realmAccess instanceof Map) {
            Object realmRoles = ((Map<?, ?>) realmAccess).get("roles");
            if (realmRoles instanceof java.util.List) {
                java.util.List<String> rolesList = new java.util.ArrayList<>();
                ((java.util.List<?>) realmRoles).forEach(role -> {
                    if (role instanceof String) {
                        rolesList.add((String) role);
                    }
                });
                roles = String.join(",", rolesList);
                System.out.println("🔑 [GATEWAY FILTER] Rôles extraits: " + roles);
            }
        }

        // Vérifier si c'est une authentification Email/Password (issuer custom)
        // Le claim "iss" peut être String (Email/Password) ou URL (OAuth2)
        Object issuerClaim = oidcUser.getClaim("iss");
        String issuer = issuerClaim != null ? issuerClaim.toString() : "";
        boolean isEmailPassword = "email-password-auth".equals(issuer);

        final String userRoles = roles;

        if (isEmailPassword) {
            // Pour Email/Password, récupérer le Keycloak ID via le service auth
            System.out.println("📧 [GATEWAY FILTER] Email/Password détecté, récupération du Keycloak ID pour: " + email);

            return authWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/api/keycloak-id-by-email")
                    .queryParam("email", email)
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    String keycloakId = (String) response.get("keycloakId");
                    System.out.println("✅ [GATEWAY FILTER] Keycloak ID (Email/Password): " + keycloakId + " pour " + email);

                    // Ajouter les headers avec le Keycloak ID
                    ServerWebExchange mutatedExchange = cleanedExchange.mutate()
                        .request(builder -> {
                            if (email != null) builder.header(HEADER_USER_EMAIL, email);
                            if (keycloakId != null) builder.header(HEADER_USER_ID, keycloakId);
                            if (name != null) builder.header(HEADER_USER_NAME, name);
                            if (givenName != null) builder.header(HEADER_USER_GIVEN_NAME, givenName);
                            if (familyName != null) builder.header(HEADER_USER_FAMILY_NAME, familyName);
                            if (picture != null) builder.header(HEADER_USER_PICTURE, picture);
                            if (userRoles != null) builder.header(HEADER_USER_ROLES, userRoles);
                        })
                        .build();

                    return chain.filter(mutatedExchange);
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GATEWAY FILTER] Erreur récupération Keycloak ID: " + error.getMessage());
                    // En cas d'erreur, continuer sans l'ID
                    return chain.filter(cleanedExchange);
                });
        } else {
            // Pour OAuth2, utiliser directement l'ID Keycloak du JWT
            String keycloakId = oidcUser.getSubject();
            System.out.println("✅ [GATEWAY FILTER] Keycloak ID (OAuth2): " + keycloakId + " pour " + email);

            ServerWebExchange mutatedExchange = cleanedExchange.mutate()
                .request(builder -> {
                    if (email != null) builder.header(HEADER_USER_EMAIL, email);
                    if (keycloakId != null) builder.header(HEADER_USER_ID, keycloakId);
                    if (name != null) builder.header(HEADER_USER_NAME, name);
                    if (givenName != null) builder.header(HEADER_USER_GIVEN_NAME, givenName);
                    if (familyName != null) builder.header(HEADER_USER_FAMILY_NAME, familyName);
                    if (picture != null) builder.header(HEADER_USER_PICTURE, picture);
                    if (userRoles != null) builder.header(HEADER_USER_ROLES, userRoles);
                })
                .build();

            return chain.filter(mutatedExchange);
        }
    }

    @Override
    public int getOrder() {
        return -1; // Exécuter ce filtre en premier
    }
}
