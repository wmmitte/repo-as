package com.intermediation.gateway;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;

/**
 * Gestionnaire personnalisé pour les sessions expirées
 * Redirige vers l'accueil au lieu de la page de login Keycloak
 */
@Component
public class SessionExpiredHandler implements ServerAuthenticationEntryPoint {

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
        String path = exchange.getRequest().getURI().getPath();
        
        // Si c'est une requête API, retourner 401
        if (path.startsWith("/api/")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        // Pour les autres routes, rediriger vers l'accueil
        exchange.getResponse().setStatusCode(HttpStatus.FOUND);
        exchange.getResponse().getHeaders().setLocation(URI.create("/"));
        return exchange.getResponse().setComplete();
    }
}
