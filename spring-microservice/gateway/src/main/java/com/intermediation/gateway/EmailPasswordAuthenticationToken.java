package com.intermediation.gateway;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;

/**
 * Token d'authentification personnalisé pour l'authentification email/password
 * qui crée un OidcUser compatible avec le système OAuth2 existant
 */
public class EmailPasswordAuthenticationToken extends AbstractAuthenticationToken {
    
    private final OidcUser principal;
    
    public EmailPasswordAuthenticationToken(Map<String, Object> userAttributes, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        
        // Créer un OidcIdToken minimal pour compatibilité
        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("sub", userAttributes.getOrDefault("id", ""));
        claims.put("email", userAttributes.getOrDefault("email", ""));
        claims.put("given_name", userAttributes.getOrDefault("prenom", ""));
        claims.put("family_name", userAttributes.getOrDefault("nom", ""));
        claims.put("name", userAttributes.getOrDefault("prenom", "") + " " + userAttributes.getOrDefault("nom", ""));
        claims.put("iss", "email-password-auth");
        claims.put("aud", "pitm-auth-service");
        claims.put("iat", Instant.now().getEpochSecond());
        claims.put("exp", Instant.now().plusSeconds(86400).getEpochSecond());
        
        // Ajouter picture seulement si présent
        if (userAttributes.get("photoUrl") != null) {
            claims.put("picture", userAttributes.get("photoUrl"));
        }

        // Ajouter les rôles si présents
        if (userAttributes.get("realm_access") != null) {
            claims.put("realm_access", userAttributes.get("realm_access"));
        }

        OidcIdToken idToken = new OidcIdToken(
            "email-password-token",
            Instant.now(),
            Instant.now().plusSeconds(86400),
            claims
        );
        
        // Créer un OidcUserInfo
        OidcUserInfo userInfo = new OidcUserInfo(userAttributes);
        
        // Créer un DefaultOidcUser compatible avec le système existant
        this.principal = new DefaultOidcUser(authorities, idToken, userInfo, "email");
        
        setAuthenticated(true);
    }
    
    @Override
    public Object getCredentials() {
        return null;
    }
    
    @Override
    public OidcUser getPrincipal() {
        return this.principal;
    }
}
