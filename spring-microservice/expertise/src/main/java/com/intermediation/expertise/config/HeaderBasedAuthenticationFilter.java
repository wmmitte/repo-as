package com.intermediation.expertise.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Filtre pour créer un contexte d'authentification à partir des headers HTTP
 * propagés par le Gateway (notamment X-User-Roles)
 *
 * Ce filtre est nécessaire pour l'authentification email/password car il n'y a pas
 * de JWT propagé dans ce cas, mais les rôles sont propagés via des headers.
 */
@Component
public class HeaderBasedAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_EMAIL = "X-User-Email";
    private static final String HEADER_USER_ROLES = "X-User-Roles";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Lire les headers propagés par le Gateway
        String userId = request.getHeader(HEADER_USER_ID);
        String userEmail = request.getHeader(HEADER_USER_EMAIL);
        String userRoles = request.getHeader(HEADER_USER_ROLES);

        // Si les headers essentiels sont présents, créer un contexte d'authentification
        // On écrase toujours l'authentification existante si les headers sont présents
        // car cela signifie que la requête vient du Gateway avec une authentification valide
        if (userId != null && !userId.isEmpty()) {
            System.out.println("🔑 [EXPERTISE FILTER] Création contexte de sécurité depuis headers");
            System.out.println("   - User ID: " + userId);
            System.out.println("   - User Email: " + userEmail);
            System.out.println("   - Roles: " + userRoles);

            // Parser les rôles
            List<GrantedAuthority> authorities = new ArrayList<>();
            if (userRoles != null && !userRoles.isEmpty()) {
                String[] roles = userRoles.split(",");
                for (String role : roles) {
                    String trimmedRole = role.trim();
                    if (!trimmedRole.isEmpty()) {
                        // Ajouter ROLE_ prefix si pas déjà présent
                        String authorityName = trimmedRole.toUpperCase();
                        if (!authorityName.startsWith("ROLE_")) {
                            authorityName = "ROLE_" + authorityName;
                        }
                        authorities.add(new SimpleGrantedAuthority(authorityName));
                        System.out.println("   - Authority ajoutée: " + authorityName);
                    }
                }
            }

            // Créer un token d'authentification pré-authentifié
            // PreAuthenticatedAuthenticationToken est conçu pour les cas où l'authentification
            // a déjà été effectuée par un système externe (ici, le Gateway)
            PreAuthenticatedAuthenticationToken authentication =
                new PreAuthenticatedAuthenticationToken(userEmail != null ? userEmail : userId, null, authorities);
            authentication.setDetails(userId);
            authentication.setAuthenticated(true);

            // Définir le contexte de sécurité (écrase l'authentification existante)
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("✅ [EXPERTISE FILTER] Contexte de sécurité créé avec " + authorities.size() + " authorities");
            System.out.println("   Thread: " + Thread.currentThread().getId() + ", Principal: " + authentication.getPrincipal());
            System.out.println("   isAuthenticated: " + authentication.isAuthenticated() + ", Class: " + authentication.getClass().getSimpleName());
        } else {
            // Si un contexte de sécurité existe déjà (JWT OAuth2), on le garde
            if (SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
                System.out.println("🔑 [EXPERTISE FILTER] Contexte de sécurité JWT déjà présent");
            } else {
                System.out.println("⚠️  [EXPERTISE FILTER] Aucun header X-User-Id trouvé et aucune authentification existante");
            }
        }

        filterChain.doFilter(request, response);

        // Vérifier si l'authentification est toujours présente après la chaîne de filtres
        org.springframework.security.core.Authentication authAfter = SecurityContextHolder.getContext().getAuthentication();
        if (authAfter != null && authAfter.isAuthenticated()) {
            System.out.println("🔍 [EXPERTISE FILTER] APRÈS filterChain - Auth toujours présente: " + authAfter.getClass().getSimpleName() + ", Authorities: " + authAfter.getAuthorities());
        } else {
            System.out.println("⚠️  [EXPERTISE FILTER] APRÈS filterChain - Auth perdue ou anonyme!");
        }
    }
}
