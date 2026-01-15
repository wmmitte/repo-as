package com.intermediation.expertise.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collection;

/**
 * Service de sécurité pour vérifier les permissions et l'ownership des ressources
 */
@Service
@Slf4j
public class SecurityService {

    /**
     * Récupère l'utilisateur actuellement authentifié
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        // Pour l'authentification header-based, l'ID est stocké dans les details
        // Pour OAuth2/JWT, l'ID est dans le principal
        Object details = authentication.getDetails();
        if (details instanceof String) {
            return (String) details;
        }
        // Fallback: L'ID utilisateur est dans le principal (subject du JWT)
        return authentication.getName();
    }

    /**
     * Vérifie si l'utilisateur courant est propriétaire de la ressource
     */
    public boolean isOwner(String resourceOwnerId) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null || resourceOwnerId == null) {
            log.warn("Vérification ownership impossible: currentUserId={}, resourceOwnerId={}",
                currentUserId, resourceOwnerId);
            return false;
        }
        boolean isOwner = currentUserId.equals(resourceOwnerId);
        log.debug("Ownership check: currentUserId={}, resourceOwnerId={}, isOwner={}",
            currentUserId, resourceOwnerId, isOwner);
        return isOwner;
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roleWithPrefix = "ROLE_" + role.toUpperCase();
        boolean hasRole = authorities.stream()
            .anyMatch(auth -> auth.getAuthority().equals(roleWithPrefix));
        log.debug("Role check: role={}, hasRole={}", role, hasRole);
        return hasRole;
    }

    /**
     * Vérifie si l'utilisateur a au moins un des rôles spécifiés
     */
    public boolean hasAnyRole(String... roles) {
        for (String role : roles) {
            if (hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie si l'utilisateur est un expert
     */
    public boolean isExpert() {
        return hasRole("expert");
    }

    /**
     * Vérifie si l'utilisateur est RH
     */
    public boolean isRh() {
        return hasRole("rh");
    }

    /**
     * Vérifie si l'utilisateur est Manager
     */
    public boolean isManager() {
        return hasRole("manager");
    }
}
