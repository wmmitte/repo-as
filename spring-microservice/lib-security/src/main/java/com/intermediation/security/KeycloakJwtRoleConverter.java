package com.intermediation.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Convertisseur pour extraire les rôles Keycloak depuis le JWT
 * et les transformer en GrantedAuthority pour Spring Security
 */
public class KeycloakJwtRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // Extraire les rôles depuis resource_access.pitm-auth-service.roles
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            Map<String, Object> clientResource = (Map<String, Object>) resourceAccess.get("pitm-auth-service");
            if (clientResource != null) {
                List<String> clientRoles = (List<String>) clientResource.get("roles");
                if (clientRoles != null) {
                    authorities.addAll(clientRoles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toList()));
                }
            }
        }

        // Extraire les rôles depuis realm_access.roles
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            List<String> realmRoles = (List<String>) realmAccess.get("roles");
            if (realmRoles != null) {
                authorities.addAll(realmRoles.stream()
                    .filter(role -> !role.startsWith("default-") && !role.startsWith("offline_") && !role.equals("uma_authorization"))
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList()));
            }
        }

        System.out.println("🔑 [JWT] Rôles extraits: " + authorities);
        return authorities;
    }
}
