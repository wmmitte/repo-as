package com.intermediation.expertise.config;

import com.intermediation.security.KeycloakJwtRoleConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8098/realms/realm_picp/protocol/openid-connect/certs}")
    private String jwkSetUri;

    @Autowired
    private HeaderBasedAuthenticationFilter headerBasedAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (accessibles sans authentification)
                .requestMatchers("/api/expertise/health", "/actuator/**").permitAll()
                .requestMatchers("/api/expertise/public/**").permitAll() // Endpoints publics pour l'accueil

                // Tous les autres endpoints nécessitent une authentification
                // L'authentification est créée via le HeaderBasedAuthenticationFilter depuis les headers propagés par le Gateway
                // Les autorisations sont vérifiées via @PreAuthorize dans les controllers
                .requestMatchers("/api/expertise/**", "/api/competences-reference/**", "/api/certifications/**", "/api/localisations/**").authenticated()
                .requestMatchers("/api/reconnaissance-competences/**", "/api/files/**").authenticated()
                .requestMatchers("/api/referentiels/**").authenticated()

                // File traitant - uniquement Manager et RH (la vérification se fait via @PreAuthorize dans le controller)
                .requestMatchers("/api/traitement-demandes/**").authenticated()

                .anyRequest().authenticated()
            )
            // Configuration OAuth2 Resource Server (pour valider les JWT avec les rôles)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            // Ajouter le filtre pour créer un contexte d'authentification depuis les headers
            // Ce filtre s'exécute APRÈS le BearerTokenAuthenticationFilter pour ne pas être écrasé
            .addFilterAfter(headerBasedAuthenticationFilter, org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class);

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

    /**
     * Bean JwtDecoder pour décoder et valider les tokens JWT de Keycloak
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
}
