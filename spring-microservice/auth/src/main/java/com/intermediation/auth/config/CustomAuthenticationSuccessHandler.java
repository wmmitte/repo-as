package com.intermediation.auth.config;

import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handler personnalisé pour gérer la redirection après authentification OAuth2 réussie
 */
@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final RequestCache requestCache = new HttpSessionRequestCache();
    private final AuthService authService;
    
    // URL par défaut si aucune ressource protégée n'était demandée
    // Redirige vers la page d'accueil (HomePage)
    private static final String DEFAULT_TARGET_URL = "/";
    
    // URL vers la page de complétion du profil
    private static final String PROFIL_INCOMPLET_URL = "/mon-compte";

    public CustomAuthenticationSuccessHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException, ServletException {
        
        System.out.println("🎉 [AUTH SUCCESS] Authentification réussie pour: " + authentication.getName());
        
        // Traiter l'utilisateur OAuth2 (créer ou mettre à jour dans la BDD)
        Utilisateur utilisateur = null;
        if (authentication.getPrincipal() instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
            String provider = determinerProvider(oidcUser);
            
            System.out.println("👤 [USER] Traitement de l'utilisateur OAuth2 - Provider: " + provider);
            utilisateur = authService.traiterAuthOAuth2(oidcUser, provider);
            System.out.println("✅ [USER] Utilisateur traité: " + utilisateur.getEmail());
        }
        
        // Vérifier si le profil est complet
        boolean profilComplet = utilisateur != null && utilisateur.getProfilComplet() != null && utilisateur.getProfilComplet();
        System.out.println("🔍 [PROFIL CHECK] Profil complet: " + profilComplet);
        
        // Si le profil n'est pas complet, toujours rediriger vers /mon-compte
        if (!profilComplet) {
            System.out.println("⚠️ [REDIRECT] Profil incomplet, redirection vers: " + PROFIL_INCOMPLET_URL);
            getRedirectStrategy().sendRedirect(request, response, PROFIL_INCOMPLET_URL);
            return;
        }
        
        // Profil complet : appliquer la logique normale de redirection
        // Récupérer la requête sauvegardée (la ressource protégée demandée avant l'auth)
        SavedRequest savedRequest = requestCache.getRequest(request, response);
        
        if (savedRequest != null) {
            String targetUrl = savedRequest.getRedirectUrl();
            System.out.println("✅ [REDIRECT] Ressource protégée demandée: " + targetUrl);
            
            // Nettoyer la requête sauvegardée
            requestCache.removeRequest(request, response);
            
            // Rediriger vers la ressource demandée
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Aucune ressource protégée demandée → redirection vers la page d'accueil
            System.out.println("🏠 [REDIRECT] Aucune ressource demandée, redirection vers: " + DEFAULT_TARGET_URL);
            getRedirectStrategy().sendRedirect(request, response, DEFAULT_TARGET_URL);
        }
    }

    /**
     * Détermine le provider OAuth à partir de l'ID token
     */
    private String determinerProvider(OidcUser principal) {
        String issuer = principal.getIssuer().toString();
        System.out.println("🔍 [DEBUG] Issuer: " + issuer);

        if (issuer.contains("google")) {
            return "google";
        } else if (issuer.contains("facebook")) {
            return "facebook";
        } else if (issuer.contains("apple")) {
            return "apple";
        } else if (issuer.contains("keycloak")) {
            // Keycloak peut déléguer à différents providers
            String identityProvider = principal.getClaimAsString("identity_provider");
            return identityProvider != null ? identityProvider.toLowerCase() : "keycloak";
        }

        return "unknown";
    }
}
