package com.intermediation.gateway;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler de succès d'authentification OAuth2 pour le Gateway
 * Redirige l'utilisateur vers /mon-compte après une authentification réussie
 */
@Component
public class GatewayAuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {

    private final WebClient webClient;

    public GatewayAuthenticationSuccessHandler(WebClient.Builder webClientBuilder) {
        // Utiliser lb://AUTH pour la découverte de service via Eureka
        this.webClient = webClientBuilder.baseUrl("lb://AUTH").build();
    }

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        ServerWebExchange exchange = webFilterExchange.getExchange();
        
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            String email = oidcUser.getEmail();
            System.out.println("🎉 [GATEWAY AUTH SUCCESS] Authentification réussie pour: " + email);

            // Récupérer le contexte BPMN depuis les cookies
            String instanceKey = null;
            String visiteurId = null;
            
            if (exchange.getRequest().getCookies().containsKey("bpmn_instanceKey")) {
                var cookie = exchange.getRequest().getCookies().getFirst("bpmn_instanceKey");
                if (cookie != null) {
                    instanceKey = cookie.getValue();
                    System.out.println("🔍 [GATEWAY] instanceKey récupéré depuis cookie: " + instanceKey);
                }
            }
            
            if (exchange.getRequest().getCookies().containsKey("bpmn_visiteurId")) {
                var cookie = exchange.getRequest().getCookies().getFirst("bpmn_visiteurId");
                if (cookie != null) {
                    visiteurId = cookie.getValue();
                    System.out.println("🔍 [GATEWAY] visiteurId récupéré depuis cookie: " + visiteurId);
                }
            }

            // Préparer les données utilisateur pour le service Auth
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("email", oidcUser.getEmail());
            userInfo.put("subject", oidcUser.getSubject());
            userInfo.put("givenName", oidcUser.getGivenName());
            userInfo.put("familyName", oidcUser.getFamilyName());
            userInfo.put("fullName", oidcUser.getFullName());
            userInfo.put("picture", oidcUser.getPicture());
            userInfo.put("issuer", oidcUser.getIssuer() != null ? oidcUser.getIssuer().toString() : null);
            userInfo.put("identityProvider", oidcUser.getClaimAsString("identity_provider"));
            
            // Ajouter le contexte BPMN s'il existe
            if (instanceKey != null) {
                userInfo.put("instanceKey", instanceKey);
            }
            if (visiteurId != null) {
                userInfo.put("visiteurId", visiteurId);
            }

            // Appeler le service Auth pour traiter l'utilisateur
            return webClient.post()
                .uri("/api/auth/oauth2/process")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(userInfo)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(authResponse -> {
                    Boolean profilComplet = (Boolean) authResponse.get("profilComplet");
                    String userId = (String) authResponse.get("userId");
                    System.out.println("🔍 [GATEWAY] Profil complet: " + profilComplet);
                    System.out.println("🔍 [GATEWAY] User ID: " + userId);

                    // Lire l'URL de redirection depuis le cookie si elle existe
                    String savedRedirectUrl = null;
                    if (exchange.getRequest().getCookies().containsKey("auth_redirect_url")) {
                        var cookie = exchange.getRequest().getCookies().getFirst("auth_redirect_url");
                        if (cookie != null && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
                            try {
                                String decodedUrl = java.net.URLDecoder.decode(cookie.getValue(), "UTF-8");
                                // Valider que l'URL commence par / (URL relative)
                                if (decodedUrl.startsWith("/")) {
                                    savedRedirectUrl = decodedUrl;
                                    System.out.println("🔍 [GATEWAY] URL de redirection décodée et validée: " + savedRedirectUrl);
                                } else {
                                    System.err.println("⚠️ [GATEWAY] URL invalide (ne commence pas par /): " + decodedUrl);
                                }
                            } catch (Exception e) {
                                System.err.println("❌ [GATEWAY] Erreur lors du décodage de l'URL: " + e.getMessage());
                            }
                        }
                    }
                    
                    // Déterminer l'URL de redirection finale
                    String redirectUrl;
                    if (profilComplet != null && !profilComplet) {
                        // Si le profil est incomplet, toujours rediriger vers /mon-compte
                        redirectUrl = "/mon-compte";
                        System.out.println("🔄 [GATEWAY] Profil incomplet, redirection vers: " + redirectUrl);
                    } else if (savedRedirectUrl != null && !savedRedirectUrl.isEmpty()) {
                        // Si une URL de redirection est sauvegardée, l'utiliser
                        redirectUrl = savedRedirectUrl;
                        System.out.println("🔄 [GATEWAY] Utilisation de l'URL sauvegardée: " + redirectUrl);
                    } else {
                        // Sinon, rediriger vers l'accueil
                        redirectUrl = "/";
                        System.out.println("🔄 [GATEWAY] Redirection par défaut vers: " + redirectUrl);
                    }

                    // Ajouter les infos d'authentification dans les query params pour le frontend
                    String redirectWithParams = redirectUrl + "?auth=success&userId=" + (userId != null ? userId : "");
                    System.out.println("🔗 [GATEWAY] URL finale construite: " + redirectWithParams);
                    
                    // Supprimer le cookie auth_redirect_url après utilisation
                    if (savedRedirectUrl != null) {
                        exchange.getResponse().addCookie(
                            org.springframework.http.ResponseCookie.from("auth_redirect_url", "")
                                .path("/")
                                .maxAge(0)
                                .build()
                        );
                        System.out.println("🗑️ [GATEWAY] Cookie auth_redirect_url supprimé");
                    }
                    
                    exchange.getResponse().setStatusCode(HttpStatus.FOUND);
                    URI finalUri = URI.create(redirectWithParams);
                    System.out.println("🎯 [GATEWAY] URI finale créée: " + finalUri.toString());
                    exchange.getResponse().getHeaders().setLocation(finalUri);
                    return exchange.getResponse().setComplete();
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GATEWAY ERROR] Erreur lors de l'appel au service Auth: " + error.getMessage());
                    error.printStackTrace();
                    // En cas d'erreur, rediriger vers /mon-compte par précaution
                    exchange.getResponse().setStatusCode(HttpStatus.FOUND);
                    exchange.getResponse().getHeaders().setLocation(URI.create("/mon-compte"));
                    return exchange.getResponse().setComplete();
                });
        }

        // Si pas d'OidcUser, redirection par défaut
        exchange.getResponse().setStatusCode(HttpStatus.FOUND);
        exchange.getResponse().getHeaders().setLocation(URI.create("/"));
        return exchange.getResponse().setComplete();
    }
}
