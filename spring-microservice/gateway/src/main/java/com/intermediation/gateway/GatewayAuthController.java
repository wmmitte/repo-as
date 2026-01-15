package com.intermediation.gateway;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur Gateway pour gérer l'authentification email/password
 * Crée un contexte d'authentification au niveau Gateway, comme OAuth2
 */
@RestController
@RequestMapping("/api/gateway/auth")
public class GatewayAuthController {

    private final WebClient authWebClient;
    private final ServerSecurityContextRepository securityContextRepository;

    public GatewayAuthController(
            WebClient.Builder webClientBuilder,
            ServerSecurityContextRepository securityContextRepository) {
        this.authWebClient = webClientBuilder.baseUrl("lb://AUTH").build();
        this.securityContextRepository = securityContextRepository;
    }

    /**
     * Inscription avec email/password
     * Délègue au service Auth mais NE CRÉE PAS de session
     * L'utilisateur doit vérifier son email avant de pouvoir se connecter
     */
    @PostMapping("/register")
    public Mono<ResponseEntity<Map<String, Object>>> register(
            @RequestBody Map<String, Object> registerRequest,
            ServerWebExchange exchange) {

        System.out.println("🔐 [GATEWAY AUTH] Demande d'inscription reçue");

        return authWebClient.post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(registerRequest)
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>(){})
                .flatMap(authResponse -> {
                    Boolean success = (Boolean) authResponse.get("success");

                    if (success == null || !success) {
                        System.out.println("❌ [GATEWAY AUTH] Échec de l'inscription");
                        return Mono.just(ResponseEntity.badRequest().body(authResponse));
                    }

                    System.out.println("✅ [GATEWAY AUTH] Inscription réussie - email de vérification envoyé");
                    System.out.println("📧 [GATEWAY AUTH] L'utilisateur doit vérifier son email avant de se connecter");

                    // NE PAS créer de session ici
                    // L'utilisateur doit vérifier son email avant de pouvoir se connecter
                    return Mono.just(ResponseEntity.ok(authResponse));
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GATEWAY AUTH] Erreur lors de l'inscription: " + error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("success", false, "message", "Erreur serveur")));
                });
    }

    /**
     * Connexion avec email/password
     * Délègue au service Auth puis crée un contexte d'authentification Gateway
     */
    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, Object>>> login(
            @RequestBody Map<String, Object> loginRequest,
            ServerWebExchange exchange) {

        System.out.println("🔐 [GATEWAY AUTH] Demande de connexion reçue");

        // Extraire le visiteurId du cookie BPMN si présent
        String visiteurId = exchange.getRequest()
                .getCookies()
                .getFirst("bpmn_visiteurId") != null
                ? exchange.getRequest().getCookies().getFirst("bpmn_visiteurId").getValue()
                : null;

        if (visiteurId != null && !visiteurId.isBlank()) {
            System.out.println("🔍 [GATEWAY AUTH] visiteurId BPMN trouvé dans cookie: " + visiteurId);
            // Ajouter le visiteurId au corps de la requête
            loginRequest.put("visiteurId", visiteurId);
        } else {
            System.out.println("ℹ️ [GATEWAY AUTH] Aucun visiteurId BPMN trouvé (connexion hors processus BPMN)");
        }

        return authWebClient.post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(loginRequest)
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>(){})
                .flatMap(authResponse -> {
                    Boolean success = (Boolean) authResponse.get("success");

                    if (success == null || !success) {
                        System.out.println("❌ [GATEWAY AUTH] Échec de la connexion");
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authResponse));
                    }

                    System.out.println("✅ [GATEWAY AUTH] Connexion réussie, création du contexte de sécurité");

                    // Extraire les informations utilisateur et rôles
                    @SuppressWarnings("unchecked")
                    Map<String, Object> utilisateur = (Map<String, Object>) authResponse.get("utilisateur");

                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) authResponse.getOrDefault("roles", List.of());
                    System.out.println("🔑 [GATEWAY AUTH] Rôles de l'utilisateur: " + roles);

                    // Ajouter les rôles aux attributs utilisateur
                    if (!roles.isEmpty()) {
                        utilisateur.put("realm_access", Map.of("roles", roles));
                    }

                    // Créer les authorities à partir des rôles Keycloak
                    List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // Rôle de base

                    // Ajouter les rôles Keycloak avec préfixe ROLE_ et en majuscules
                    for (String role : roles) {
                        String roleUpper = role.toUpperCase();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleUpper));
                        System.out.println("🔑 [GATEWAY AUTH] Ajout authority: ROLE_" + roleUpper);
                    }

                    // Créer un token d'authentification compatible OAuth2
                    EmailPasswordAuthenticationToken authToken = new EmailPasswordAuthenticationToken(
                            utilisateur,
                            authorities
                    );

                    // Créer le SecurityContext
                    SecurityContext securityContext = new SecurityContextImpl(authToken);

                    // Sauvegarder dans la session
                    return securityContextRepository.save(exchange, securityContext)
                            .then(Mono.just(ResponseEntity.ok(authResponse)));
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GATEWAY AUTH] Erreur lors de la connexion: " + error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("success", false, "message", "Erreur serveur")));
                });
    }
}
