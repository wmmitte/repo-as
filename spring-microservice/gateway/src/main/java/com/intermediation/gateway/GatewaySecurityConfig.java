package com.intermediation.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository;
import reactor.core.publisher.Mono;

/**
 * Configuration de sécurité OAuth2 pour le Gateway
 * Gère l'authentification sociale (Google via Keycloak) et propage les infos aux services backend
 */
@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    private final GatewayAuthenticationSuccessHandler authenticationSuccessHandler;
    private final CustomOAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private final SessionExpiredHandler sessionExpiredHandler;

    public GatewaySecurityConfig(
            GatewayAuthenticationSuccessHandler authenticationSuccessHandler,
            CustomOAuth2AuthorizationRequestResolver authorizationRequestResolver,
            SessionExpiredHandler sessionExpiredHandler) {
        this.authenticationSuccessHandler = authenticationSuccessHandler;
        this.authorizationRequestResolver = authorizationRequestResolver;
        this.sessionExpiredHandler = sessionExpiredHandler;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .authorizeExchange(exchanges -> exchanges
                // Routes publiques - Page d'accueil et assets
                .pathMatchers("/", "/index.html").permitAll()
                .pathMatchers("/assets/**", "/vite.svg", "/favicon.ico", "/*.js", "/*.css").permitAll()
                
                // Routes OAuth2 (login/logout)
                .pathMatchers("/oauth2/**", "/login/**", "/logout").permitAll()
                
                // Endpoints Actuator publics
                .pathMatchers("/actuator/health", "/actuator/info", "/actuator/refresh").permitAll()
                
                // Endpoints d'authentification par email/mot de passe (via Gateway)
                .pathMatchers("/api/gateway/auth/**").permitAll()
                
                // Endpoints d'authentification directs (pour compatibilité)
                .pathMatchers("/api/auth/register", "/api/auth/login").permitAll()

                // Endpoints de vérification d'email (publics)
                .pathMatchers("/api/auth/verifier-email", "/api/auth/renvoyer-verification").permitAll()

                // Endpoint pour vérifier l'authentification
                .pathMatchers("/api/me").permitAll()
                
                // Endpoints de profil (gestion de session côté Auth service)
                .pathMatchers("/api/profil/**").permitAll()
                
                // APIs publiques
                .pathMatchers("/api/acceuil/public/**").permitAll()
                .pathMatchers("/api/acceuil/api/**").permitAll()
                
                // APIs du référentiel de compétences (authentification via header X-User-Id)
                .pathMatchers("/api/competences-reference/**").permitAll()
                
                // APIs des certifications (authentification via header X-User-Id)
                .pathMatchers("/api/certifications/**").permitAll()
                
                // APIs des localisations (authentification via header X-User-Id)
                .pathMatchers("/api/localisations/**").permitAll()
                
                // APIs d'expertise (authentification via header X-User-Id)
                .pathMatchers("/api/expertise/**").permitAll()

                // APIs des référentiels (domaines, critères, méthodes d'évaluation)
                .pathMatchers("/api/referentiels/**").permitAll()

                // APIs de reconnaissance de compétences (authentification via header X-User-Id)
                .pathMatchers("/api/reconnaissance-competences/**").permitAll()

                // APIs de demandes de reconnaissance (authentification via header X-User-Id)
                .pathMatchers("/api/demandes-reconnaissance/**").permitAll()

                // APIs de traitement des demandes (authentification via header X-User-Id)
                .pathMatchers("/api/traitement-demandes/**").permitAll()

                // APIs de gestion de fichiers (authentification via header X-User-Id)
                .pathMatchers("/api/files/**").permitAll()

                // Routes frontend (SPA React) - L'authentification est gérée côté client par React Router
                // Toutes les routes qui ne commencent pas par /api sont des routes frontend
                .pathMatchers("/explorer", "/rechercher", "/reseau", "/profil/**", "/mon-compte",
                             "/expertise", "/expertise/**", "/competences", "/competences/**",
                             "/projets", "/projets/**", "/plus", "/expertise-profil/**",
                             "/verifier-email", "/confirmation-inscription").permitAll()
                
                // Toutes les autres routes nécessitent une authentification
                .anyExchange().authenticated()
            )
            // Configuration OAuth2 Login - authentification sociale via Keycloak
            .oauth2Login(oauth2 -> oauth2
                .authorizationRequestResolver(authorizationRequestResolver)
                .authenticationSuccessHandler(authenticationSuccessHandler)
            )
            
            // Gestionnaire d'expiration de session
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(sessionExpiredHandler)
            )
            
            // Logout - Configuration complète pour WebFlux
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessHandler((exchange, authentication) -> {
                    System.out.println("🚪 [GATEWAY] Déconnexion demandée pour: " +
                        (authentication != null ? authentication.getName() : "anonyme"));

                    // Invalider la session WebFlux et nettoyer les cookies
                    return exchange.getExchange().getSession()
                        .flatMap(session -> {
                            System.out.println("🗑️ [GATEWAY] Invalidation de la session: " + session.getId());
                            return session.invalidate();
                        })
                        .then(Mono.fromRunnable(() -> {
                            // Supprimer le cookie de session en définissant maxAge=0
                            exchange.getExchange().getResponse().addCookie(
                                org.springframework.http.ResponseCookie
                                    .from("SESSION", "")
                                    .path("/")
                                    .maxAge(0)
                                    .httpOnly(true)
                                    .build()
                            );
                            System.out.println("🧹 [GATEWAY] Cookie SESSION supprimé");
                        }))
                        .then(exchange.getExchange().getResponse().setComplete());
                })
            )
            
            // Désactiver CSRF pour simplifier (à activer en production avec configuration appropriée)
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            
            .build();
    }
    
    /**
     * Bean pour le repository de contexte de sécurité
     * Utilisé par GatewayAuthController pour sauvegarder le contexte d'authentification email/password
     */
    @Bean
    public ServerSecurityContextRepository serverSecurityContextRepository() {
        return new WebSessionServerSecurityContextRepository();
    }
}
