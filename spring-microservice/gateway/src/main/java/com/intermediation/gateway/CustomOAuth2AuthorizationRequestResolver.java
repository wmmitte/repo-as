package com.intermediation.gateway;

import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolver personnalisé pour ajouter kc_idp_hint aux requêtes d'autorisation OAuth2
 * Permet de sauter la page de sélection Keycloak et rediriger directement vers le provider
 */
@Component
public class CustomOAuth2AuthorizationRequestResolver implements ServerOAuth2AuthorizationRequestResolver {

    private final DefaultServerOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomOAuth2AuthorizationRequestResolver(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        this.defaultResolver = new DefaultServerOAuth2AuthorizationRequestResolver(clientRegistrationRepository);
    }

    @Override
    public Mono<OAuth2AuthorizationRequest> resolve(ServerWebExchange exchange) {
        return defaultResolver.resolve(exchange)
            .flatMap(authorizationRequest -> customizeAuthorizationRequest(authorizationRequest, exchange));
    }

    @Override
    public Mono<OAuth2AuthorizationRequest> resolve(ServerWebExchange exchange, String clientRegistrationId) {
        return defaultResolver.resolve(exchange, clientRegistrationId)
            .flatMap(authorizationRequest -> customizeAuthorizationRequest(authorizationRequest, exchange));
    }

    private Mono<OAuth2AuthorizationRequest> customizeAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            ServerWebExchange exchange) {

        if (authorizationRequest == null) {
            return Mono.empty();
        }

        // Récupérer le paramètre kc_idp_hint de la requête
        String idpHint = exchange.getRequest().getQueryParams().getFirst("kc_idp_hint");

        if (idpHint != null && !idpHint.isEmpty()) {
            System.out.println("✅ [GATEWAY] kc_idp_hint détecté: " + idpHint);

            // Ajouter le paramètre aux paramètres additionnels de la requête OAuth2
            Map<String, Object> additionalParameters = new HashMap<>(authorizationRequest.getAdditionalParameters());
            additionalParameters.put("kc_idp_hint", idpHint);

            OAuth2AuthorizationRequest customRequest = OAuth2AuthorizationRequest
                .from(authorizationRequest)
                .additionalParameters(additionalParameters)
                .build();

            return Mono.just(customRequest);
        }

        return Mono.just(authorizationRequest);
    }
}
