package com.intermediation.auth.config;

import com.intermediation.security.KeycloakJwtRoleConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final CustomAuthenticationSuccessHandler authenticationSuccessHandler;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                         ClientRegistrationRepository clientRegistrationRepository,
                         CustomAuthenticationSuccessHandler authenticationSuccessHandler) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.authenticationSuccessHandler = authenticationSuccessHandler;
    }

    /**
     * Customise les requêtes OAuth2 pour ajouter kc_idp_hint si présent dans les paramètres
     */
    private OAuth2AuthorizationRequestResolver authorizationRequestResolver() {
        DefaultOAuth2AuthorizationRequestResolver defaultResolver =
            new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, 
                "/oauth2/authorization"
            );
        
        // Wrapper pour customiser la requête
        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request);
                return customizeAuthorizationRequest(authorizationRequest, request);
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                OAuth2AuthorizationRequest authorizationRequest = 
                    defaultResolver.resolve(request, clientRegistrationId);
                return customizeAuthorizationRequest(authorizationRequest, request);
            }

            private OAuth2AuthorizationRequest customizeAuthorizationRequest(
                    OAuth2AuthorizationRequest authorizationRequest, 
                    HttpServletRequest request) {
                
                if (authorizationRequest == null) {
                    return null;
                }
                
                String idpHint = request.getParameter("kc_idp_hint");
                System.out.println("🔍 [DEBUG] kc_idp_hint parameter: " + idpHint);
                
                if (idpHint != null && !idpHint.isEmpty()) {
                    Map<String, Object> additionalParameters = new HashMap<>(
                        authorizationRequest.getAdditionalParameters()
                    );
                    additionalParameters.put("kc_idp_hint", idpHint);
                    
                    System.out.println("✅ [DEBUG] Adding kc_idp_hint=" + idpHint + " to authorization request");
                    
                    return OAuth2AuthorizationRequest.from(authorizationRequest)
                        .additionalParameters(additionalParameters)
                        .build();
                }
                
                return authorizationRequest;
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Configuration CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            .authorizeHttpRequests(authorize -> authorize
                // Endpoints publics
                .requestMatchers("/api/health", "/actuator/**").permitAll()
                // Routes OAuth2
                .requestMatchers("/login/**", "/oauth2/**").permitAll()
                // Callback après authentification
                .requestMatchers("/api/oauth2/success").permitAll()
                // Endpoints d'authentification par email/mot de passe (appelés par le Gateway)
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                // Endpoints de vérification d'email (publics)
                .requestMatchers("/api/auth/verifier-email", "/api/auth/renvoyer-verification").permitAll()
                // Endpoints pour appels internes depuis le Gateway (headers X-User-Email)
                // Note: /api/profil/** est accessible mais le contrôleur vérifie X-User-Email
                .requestMatchers("/api/auth/oauth2/process", "/api/me", "/api/profil/**", "/api/logout", "/api/user-id-by-email", "/api/keycloak-id-by-email").permitAll()
                // Endpoints pour appels inter-services (expertise -> auth)
                .requestMatchers("/api/utilisateurs/**").permitAll()
                // Tout le reste nécessite authentification ET profil complet (sera géré par le handler)
                .anyRequest().authenticated()
            )
            // Configuration OAuth2 Login
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestResolver(authorizationRequestResolver())
                )
                .successHandler(authenticationSuccessHandler)
            )
            // Configuration OAuth2 Resource Server (pour valider les JWT)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            // Désactiver CSRF (API REST)
            .csrf(csrf -> csrf.disable());

        return http.build();
    }

    /**
     * Convertisseur JWT pour extraire les rôles Keycloak
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakJwtRoleConverter());
        return converter;
    }
}
