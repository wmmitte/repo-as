package com.intermediation.libsecurity.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 DGTCP, All rights reserved.
 * @since : 2025/03/14 à 00:12
 */

@Configuration
@EnableWebFluxSecurity
@ConditionalOnClass(name = "org.springframework.web.reactive.DispatcherHandler")
@ConditionalOnMissingClass("org.springframework.cloud.gateway.config.GatewayAutoConfiguration")  // Ne pas charger dans Gateway
public class SecurityWebFluxConfig {
    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        return http.authorizeExchange(auth -> auth
                        // Routes publiques
                        .pathMatchers("/", "/index.html").permitAll()
                        .pathMatchers("/assets/**", "/vite.svg", "/*.js", "/*.css").permitAll()
                        .pathMatchers("/actuator/health", "/actuator/info", "/actuator/refresh").permitAll()
                        .pathMatchers("/api/acceuil/public/**").permitAll()  // APIs publiques uniquement
                        // Tout le reste nécessite une authentification JWT
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .build();
    }
}
