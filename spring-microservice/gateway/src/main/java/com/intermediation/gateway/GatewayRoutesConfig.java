package com.intermediation.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration des routes du Gateway
 */
@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Route OAuth2 vers le service Auth
            .route("auth-oauth2", r -> r
                .path("/oauth2/**", "/login/**")
                .filters(f -> f.preserveHostHeader())
                .uri("lb://AUTH"))
            
            // Route API Auth vers le service Auth
            .route("auth-api", r -> r
                .path("/api/auth/**", "/api/me", "/api/oauth2/**", "/api/logout", "/api/profil/**")
                .uri("lb://AUTH"))
            
            // Route API Acceuil vers le service Acceuil
            // StripPrefix=2 retire /api/acceuil du path
            .route("acceuil-api", r -> r
                .path("/api/acceuil/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://ACCEUIL"))
            
            // Route API Expertise vers le service Expertise
            .route("expertise-api", r -> r
                .path("/api/expertise/**")
                .uri("lb://EXPERTISE"))
            
            // Route API Référentiel de Compétences vers le service Expertise
            .route("competences-reference-api", r -> r
                .path("/api/competences-reference/**")
                .uri("lb://EXPERTISE"))
            
            // Route API Certifications vers le service Expertise
            .route("certifications-api", r -> r
                .path("/api/certifications/**")
                .uri("lb://EXPERTISE"))
            
            // Route API Localisations (Pays/Villes) vers le service Expertise
            .route("localisations-api", r -> r
                .path("/api/localisations/**")
                .uri("lb://EXPERTISE"))
            
            // Route API Reconnaissance de Compétences vers le service Expertise
            .route("reconnaissance-competences-api", r -> r
                .path("/api/reconnaissance-competences/**")
                .uri("lb://EXPERTISE"))

            // Route API Demandes de Reconnaissance vers le service Expertise
            .route("demandes-reconnaissance-api", r -> r
                .path("/api/demandes-reconnaissance/**")
                .uri("lb://EXPERTISE"))

            // Route API Traitement des Demandes vers le service Expertise
            .route("traitement-demandes-api", r -> r
                .path("/api/traitement-demandes/**")
                .uri("lb://EXPERTISE"))
            
            // Route API Gestion de Fichiers vers le service Expertise
            .route("files-api", r -> r
                .path("/api/files/**")
                .uri("lb://EXPERTISE"))

            // Route API Référentiels (domaines, critères, méthodes) vers le service Expertise
            .route("referentiels-api", r -> r
                .path("/api/referentiels/**")
                .uri("lb://EXPERTISE"))

            .build();
    }
}
