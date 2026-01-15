package com.intermediation.auth.controller;

import com.intermediation.auth.dto.LoginRequest;
import com.intermediation.auth.dto.RegisterRequest;
import com.intermediation.auth.dto.UtilisateurDTO;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.service.AuthService;
import com.intermediation.auth.service.EmailService;
import com.intermediation.auth.service.KeycloakService;
import com.intermediation.auth.service.TokenVerificationService;
import io.camunda.zeebe.client.ZeebeClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final TokenVerificationService tokenVerificationService;
    private final EmailService emailService;
    private final ZeebeClient zeebeClient;
    private final KeycloakService keycloakService;

    public AuthController(AuthService authService,
                         TokenVerificationService tokenVerificationService,
                         EmailService emailService,
                         ZeebeClient zeebeClient,
                         KeycloakService keycloakService) {
        this.authService = authService;
        this.tokenVerificationService = tokenVerificationService;
        this.emailService = emailService;
        this.zeebeClient = zeebeClient;
        this.keycloakService = keycloakService;
    }

    /**
     * Callback après authentification OAuth2 réussie
     * Appelé automatiquement par Spring Security
     */
    @GetMapping("/oauth2/success")
    public ResponseEntity<Map<String, Object>> oauth2Success(
            @AuthenticationPrincipal OidcUser principal,
            @RequestParam(required = false) String redirect) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        // Déterminer le provider (Google, Facebook, Apple)
        String provider = determinerProvider(principal);

        // Traiter l'authentification (inscription ou connexion)
        Utilisateur utilisateur = authService.traiterAuthOAuth2(principal, provider);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("utilisateur", new UtilisateurDTO(utilisateur));
        response.put("message", utilisateur.getDateCreation().equals(utilisateur.getDerniereConnexion()) ?
                "Inscription réussie" : "Connexion réussie");

        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les informations de l'utilisateur connecté
     * Utilise le header X-User-Email propagé par le Gateway ou le principal OAuth2
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Roles", required = false) String userRoles,
            @AuthenticationPrincipal OidcUser principal) {

        System.out.println("🔍 [/api/me] Header X-User-Email: " + userEmail);
        System.out.println("🔍 [/api/me] Header X-User-Roles: " + userRoles);
        System.out.println("🔍 [/api/me] Principal: " + (principal != null ? principal.getEmail() : "null"));

        // Priorité : header X-User-Email (propagé par Gateway) > principal OAuth2
        final String email = (userEmail != null) ? userEmail :
                            (principal != null ? principal.getEmail() : null);

        if (email == null) {
            System.out.println("❌ [/api/me] Aucun email trouvé - utilisateur non authentifié");
            return ResponseEntity.ok(Map.of("authenticated", false));
        }

        // Récupérer les rôles depuis le header (auth email/password) ou depuis le principal (OAuth2)
        List<String> roles = new ArrayList<>();
        if (userRoles != null && !userRoles.isEmpty()) {
            // Rôles depuis le header (authentification email/password)
            roles = Arrays.stream(userRoles.split(","))
                    .map(String::trim)
                    .filter(role -> !role.isEmpty())
                    .collect(Collectors.toList());
            System.out.println("🔑 [/api/me] Rôles depuis header: " + roles);
        } else if (principal != null) {
            // Rôles depuis le JWT OAuth2
            roles = extractRolesFromPrincipal(principal);
            System.out.println("🔑 [/api/me] Rôles depuis JWT: " + roles);
        }

        System.out.println("✅ [/api/me] Email identifié: " + email);

        final List<String> finalRoles = roles;
        return authService.trouverParEmail(email)
                .map(utilisateur -> {
                    System.out.println("✅ [/api/me] Utilisateur trouvé: " + utilisateur.getEmail());
                    UtilisateurDTO dto = new UtilisateurDTO(utilisateur);
                    dto.setRoles(finalRoles);
                    return ResponseEntity.ok()
                            .body(Map.of(
                                    "authenticated", true,
                                    "utilisateur", dto
                            ));
                })
                .orElseGet(() -> {
                    System.out.println("❌ [/api/me] Utilisateur non trouvé en base pour: " + email);
                    return ResponseEntity.ok(Map.of("authenticated", false));
                });
    }

    /**
     * Extrait les rôles depuis le JWT OAuth2
     */
    private List<String> extractRolesFromPrincipal(OidcUser principal) {
        List<String> roles = new ArrayList<>();

        // Rôles depuis resource_access.pitm-auth-service.roles
        Object resourceAccess = principal.getClaim("resource_access");
        if (resourceAccess instanceof Map) {
            Object clientResource = ((Map<?, ?>) resourceAccess).get("pitm-auth-service");
            if (clientResource instanceof Map) {
                Object clientRoles = ((Map<?, ?>) clientResource).get("roles");
                if (clientRoles instanceof List) {
                    ((List<?>) clientRoles).forEach(role -> {
                        if (role instanceof String) {
                            roles.add((String) role);
                        }
                    });
                }
            }
        }

        // Rôles depuis realm_access.roles
        Object realmAccess = principal.getClaim("realm_access");
        if (realmAccess instanceof Map) {
            Object realmRoles = ((Map<?, ?>) realmAccess).get("roles");
            if (realmRoles instanceof List) {
                ((List<?>) realmRoles).forEach(role -> {
                    if (role instanceof String && !((String) role).startsWith("default-")
                        && !((String) role).startsWith("offline_")
                        && !role.equals("uma_authorization")) {
                        if (!roles.contains((String) role)) {
                            roles.add((String) role);
                        }
                    }
                });
            }
        }

        return roles;
    }

    /**
     * Récupère l'ID utilisateur par email (pour le Gateway)
     * GET /api/user-id-by-email?email=user@example.com
     */
    @GetMapping("/user-id-by-email")
    public ResponseEntity<Map<String, String>> getUserIdByEmail(
            @RequestParam String email) {
        
        return authService.trouverParEmail(email)
                .map(utilisateur -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("userId", utilisateur.getId());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint de déconnexion
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Déconnexion réussie");
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de santé
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "Auth");
        return ResponseEntity.ok(status);
    }

    /**
     * Inscription avec email et mot de passe
     * Un email de vérification est envoyé à l'utilisateur
     */
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("[INSCRIPTION] Tentative d'inscription pour: " + request.getEmail());

            // Créer l'utilisateur (l'email de vérification est envoyé dans le service)
            Utilisateur utilisateur = authService.inscrireAvecMotDePasse(
                request.getNom(),
                request.getPrenom(),
                request.getEmail(),
                request.getMotDePasse()
            );

            System.out.println("[INSCRIPTION] Inscription réussie pour: " + utilisateur.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Inscription réussie ! Un email de vérification a été envoyé à " + request.getEmail());
            response.put("emailEnvoye", true);
            response.put("emailVerifie", false);
            response.put("utilisateur", new UtilisateurDTO(utilisateur));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("[INSCRIPTION] Erreur: " + e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Connexion avec email et mot de passe
     * Bloque si l'email n'est pas vérifié
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("[CONNEXION] Tentative de connexion pour: " + request.getEmail());
            String visiteurId = request.getVisiteurId();
            if (visiteurId != null) {
                System.out.println("[CONNEXION] visiteurId BPMN fourni: " + visiteurId);
            }

            // Vérifier les credentials
            Utilisateur utilisateur = authService.connecterAvecMotDePasse(
                request.getEmail(),
                request.getMotDePasse()
            );

            System.out.println("[CONNEXION] Connexion réussie pour: " + utilisateur.getEmail());

            // Si visiteurId est fourni, envoyer le message BPMN d'authentification réussie
            if (visiteurId != null && !visiteurId.isBlank()) {
                envoyerMessageAuthentificationReussie(visiteurId, utilisateur.getId(), utilisateur.getEmail());
            }

            // Récupérer les rôles Keycloak de l'utilisateur
            String keycloakUserId = keycloakService.getUserIdByEmail(utilisateur.getEmail());
            List<String> roles = List.of(); // Par défaut vide
            if (keycloakUserId != null) {
                roles = keycloakService.obtenirRolesUtilisateur(keycloakUserId);
            }
            System.out.println("🔑 [CONNEXION] Rôles de l'utilisateur " + utilisateur.getEmail() + ": " + roles);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Connexion réussie");
            response.put("utilisateur", new UtilisateurDTO(utilisateur));
            response.put("roles", roles);

            return ResponseEntity.ok(response);

        } catch (AuthService.EmailNonVerifieException e) {
            System.err.println("[CONNEXION] Email non vérifié pour: " + request.getEmail());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("emailNonVerifie", true);
            error.put("email", request.getEmail());

            return ResponseEntity.status(403).body(error);

        } catch (Exception e) {
            System.err.println("[CONNEXION] Erreur: " + e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity.status(401).body(error);
        }
    }

    /**
     * Vérification de l'email via le token reçu par email
     */
    @GetMapping("/auth/verifier-email")
    public ResponseEntity<?> verifierEmail(@RequestParam String token) {
        System.out.println("[VERIFICATION] Tentative de vérification avec token: " + token.substring(0, Math.min(10, token.length())) + "...");

        Optional<Utilisateur> utilisateurOpt = tokenVerificationService.verifierToken(token);

        if (utilisateurOpt.isEmpty()) {
            System.err.println("[VERIFICATION] Token invalide ou expiré");

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.");
            error.put("tokenExpire", true);

            return ResponseEntity.badRequest().body(error);
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        System.out.println("[VERIFICATION] Email vérifié avec succès pour: " + utilisateur.getEmail());

        // Envoyer email de confirmation
        emailService.envoyerEmailConfirmation(utilisateur.getEmail(), utilisateur.getPrenom());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.");
        response.put("utilisateur", new UtilisateurDTO(utilisateur));

        return ResponseEntity.ok(response);
    }

    /**
     * Renvoyer l'email de vérification
     */
    @PostMapping("/auth/renvoyer-verification")
    public ResponseEntity<?> renvoyerVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "L'email est requis");
            return ResponseEntity.badRequest().body(error);
        }

        System.out.println("[RENVOYER] Demande de renvoi de vérification pour: " + email);

        // Vérifier si l'utilisateur existe
        Optional<Utilisateur> utilisateurOpt = authService.trouverParEmail(email);

        if (utilisateurOpt.isEmpty()) {
            // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.");
            return ResponseEntity.ok(response);
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        // Vérifier si l'email est déjà vérifié
        if (Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Votre email est déjà vérifié. Vous pouvez vous connecter.");
            response.put("dejaVerifie", true);
            return ResponseEntity.ok(response);
        }

        // Renouveler le token et envoyer l'email
        Optional<String> nouveauToken = tokenVerificationService.renouvelerToken(email);

        if (nouveauToken.isPresent()) {
            emailService.envoyerEmailVerification(
                utilisateur.getEmail(),
                utilisateur.getPrenom(),
                utilisateur.getNom(),
                nouveauToken.get()
            );
            System.out.println("[RENVOYER] Email de vérification renvoyé à: " + email);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Un nouveau lien de vérification a été envoyé à " + email);

        return ResponseEntity.ok(response);
    }

    /**
     * Détermine le provider OAuth à partir de l'ID token
     */
    private String determinerProvider(OidcUser principal) {
        String issuer = principal.getIssuer().toString();
        System.out.println("🔍 [DEBUG] Issuer: " + issuer);
        System.out.println("🔍 [DEBUG] All claims: " + principal.getClaims());

        if (issuer.contains("google")) {
            System.out.println("✅ [DEBUG] Provider détecté: google (via issuer)");
            return "google";
        } else if (issuer.contains("facebook")) {
            System.out.println("✅ [DEBUG] Provider détecté: facebook (via issuer)");
            return "facebook";
        } else if (issuer.contains("apple")) {
            System.out.println("✅ [DEBUG] Provider détecté: apple (via issuer)");
            return "apple";
        } else if (issuer.contains("keycloak")) {
            // Keycloak peut déléguer à différents providers
            // On peut vérifier l'attribut "identity_provider" dans les claims
            String identityProvider = principal.getClaimAsString("identity_provider");
            System.out.println("🔍 [DEBUG] Identity provider claim: " + identityProvider);

            String finalProvider = identityProvider != null ? identityProvider.toLowerCase() : "keycloak";
            System.out.println("✅ [DEBUG] Provider détecté: " + finalProvider + " (via Keycloak)");
            return finalProvider;
        }

        System.out.println("⚠️ [DEBUG] Provider inconnu, retour: unknown");
        return "unknown";
    }

    /**
     * Envoie un message d'authentification réussie au processus BPMN
     * Le message déclenchera l'événement intermédiaire "Attendre authentification"
     * Corrélation par visiteurId
     */
    private void envoyerMessageAuthentificationReussie(String visiteurId, String utilisateurId, String email) {
        try {
            System.out.println("📤 [AUTH CONTROLLER] Envoi message 'msg_authentification_reussie' via Zeebe...");
            System.out.println("   Corrélation: visiteurId=" + visiteurId);

            // Préparer les variables à envoyer avec le message
            Map<String, Object> variables = new HashMap<>();
            variables.put("authentifie", true);
            variables.put("utilisateurId", utilisateurId);
            variables.put("email", email);

            // Envoyer le message corrélé par visiteurId
            zeebeClient.newPublishMessageCommand()
                .messageName("msg_authentification_reussie")
                .correlationKey(visiteurId)
                .variables(variables)
                .send()
                .join();

            System.out.println("✅ [AUTH CONTROLLER] Message BPMN 'msg_authentification_reussie' envoyé avec succès");
            System.out.println("   - visiteurId (correlation): " + visiteurId);
            System.out.println("   - authentifie: true");
            System.out.println("   - utilisateurId: " + utilisateurId);
            System.out.println("   - email: " + email);

        } catch (Exception e) {
            System.err.println("❌ [AUTH CONTROLLER] Erreur lors de l'envoi du message BPMN: " + e.getMessage());
            e.printStackTrace();
            // Ne pas échouer l'authentification si l'envoi du message BPMN échoue
        }
    }

    /**
     * Récupérer les rôles de l'utilisateur connecté
     * Endpoint utilisé par le frontend pour vérifier les permissions
     */
    @GetMapping("/me/roles")
    public ResponseEntity<?> getUserRoles(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        try {
            // Extraire les rôles depuis le token JWT
            List<String> roles = new java.util.ArrayList<>();

            // Rôles depuis resource_access.pitm-auth-service.roles
            Object resourceAccess = principal.getClaim("resource_access");
            if (resourceAccess instanceof Map) {
                Object clientResource = ((Map<?, ?>) resourceAccess).get("pitm-auth-service");
                if (clientResource instanceof Map) {
                    Object clientRoles = ((Map<?, ?>) clientResource).get("roles");
                    if (clientRoles instanceof List) {
                        ((List<?>) clientRoles).forEach(role -> {
                            if (role instanceof String) {
                                roles.add((String) role);
                            }
                        });
                    }
                }
            }

            // Rôles depuis realm_access.roles
            Object realmAccess = principal.getClaim("realm_access");
            if (realmAccess instanceof Map) {
                Object realmRoles = ((Map<?, ?>) realmAccess).get("roles");
                if (realmRoles instanceof List) {
                    ((List<?>) realmRoles).forEach(role -> {
                        if (role instanceof String && !((String) role).startsWith("default-")
                            && !((String) role).startsWith("offline_")
                            && !role.equals("uma_authorization")) {
                            if (!roles.contains((String) role)) {
                                roles.add((String) role);
                            }
                        }
                    });
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("roles", roles);
            response.put("email", principal.getEmail());

            System.out.println("🔑 [ROLES] Rôles utilisateur " + principal.getEmail() + ": " + roles);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ [ROLES] Erreur lors de la récupération des rôles: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de la récupération des rôles"));
        }
    }

    /**
     * Récupérer le Keycloak ID d'un utilisateur par son email
     * Utilisé par le Gateway pour le mode Email/Password
     */
    @GetMapping("/keycloak-id-by-email")
    public ResponseEntity<Map<String, String>> getKeycloakIdByEmail(@RequestParam String email) {
        try {
            System.out.println("🔍 [AUTH] Recherche Keycloak ID pour email: " + email);

            String keycloakId = keycloakService.getKeycloakIdByEmail(email);

            if (keycloakId == null) {
                System.err.println("❌ [AUTH] Keycloak ID non trouvé pour: " + email);
                return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
            }

            System.out.println("✅ [AUTH] Keycloak ID trouvé: " + keycloakId + " pour " + email);
            return ResponseEntity.ok(Map.of("keycloakId", keycloakId));

        } catch (Exception e) {
            System.err.println("❌ [AUTH] Erreur lors de la récupération du Keycloak ID: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }
}
