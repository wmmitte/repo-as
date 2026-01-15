package com.intermediation.auth.service;

import com.intermediation.auth.dto.OAuth2UserInfoDTO;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final KeycloakService keycloakService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TokenVerificationService tokenVerificationService;
    private final EmailService emailService;

    public AuthService(UtilisateurRepository utilisateurRepository,
                      KeycloakService keycloakService,
                      TokenVerificationService tokenVerificationService,
                      EmailService emailService) {
        this.utilisateurRepository = utilisateurRepository;
        this.keycloakService = keycloakService;
        this.tokenVerificationService = tokenVerificationService;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Traite l'authentification OAuth2 (appelé depuis le Gateway via API REST)
     * Crée un nouvel utilisateur si nécessaire (inscription)
     * Met à jour les infos si l'utilisateur existe déjà (connexion)
     */
    @Transactional
    public Utilisateur traiterAuthOAuth2(OAuth2UserInfoDTO userInfo) {
        String email = userInfo.getEmail();
        String providerId = userInfo.getSubject();
        String provider = determinerProvider(userInfo);

        // Vérifier si l'utilisateur existe déjà
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(email);

        Utilisateur utilisateur;

        if (existingUser.isPresent()) {
            // CONNEXION : Utilisateur existant
            utilisateur = existingUser.get();

            // Lier le provider s'il n'est pas déjà lié
            lierProvider(utilisateur, provider, providerId);

            // Mettre à jour les informations si changées
            mettreAJourInfosDTO(utilisateur, userInfo);

        } else {
            // INSCRIPTION : Nouvel utilisateur
            utilisateur = new Utilisateur();
            utilisateur.setEmail(email);
            utilisateur.setNom(userInfo.getFamilyName());
            utilisateur.setPrenom(userInfo.getGivenName());
            utilisateur.setPhotoUrl(userInfo.getPicture());

            // Lier le provider
            lierProvider(utilisateur, provider, providerId);
        }

        // Mettre à jour la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());

        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Traite l'authentification OAuth2 (version legacy avec OidcUser - utilisée par l'ancien handler)
     * @deprecated Utilisez traiterAuthOAuth2(OAuth2UserInfoDTO) à la place
     */
    @Deprecated
    @Transactional
    public Utilisateur traiterAuthOAuth2(OidcUser oidcUser, String provider) {
        String email = oidcUser.getEmail();
        String providerId = oidcUser.getSubject();

        // Vérifier si l'utilisateur existe déjà
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(email);

        Utilisateur utilisateur;

        if (existingUser.isPresent()) {
            // CONNEXION : Utilisateur existant
            utilisateur = existingUser.get();

            // Lier le provider s'il n'est pas déjà lié
            lierProvider(utilisateur, provider, providerId);

            // Mettre à jour les informations si changées
            mettreAJourInfos(utilisateur, oidcUser);

        } else {
            // INSCRIPTION : Nouvel utilisateur
            utilisateur = new Utilisateur();
            utilisateur.setEmail(email);
            utilisateur.setNom(oidcUser.getFamilyName());
            utilisateur.setPrenom(oidcUser.getGivenName());
            utilisateur.setPhotoUrl(oidcUser.getPicture());

            // Lier le provider
            lierProvider(utilisateur, provider, providerId);
        }

        // Mettre à jour la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());

        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Lie un provider OAuth à l'utilisateur
     */
    private void lierProvider(Utilisateur utilisateur, String provider, String providerId) {
        switch (provider.toLowerCase()) {
            case "google":
            case "keycloak":  // Keycloak peut être utilisé pour Google
            case "unknown":   // Par défaut, on considère que c'est Google via Keycloak
                if (utilisateur.getGoogleId() == null) {
                    utilisateur.setGoogleId(providerId);
                    System.out.println("✅ [DEBUG] google_id lié: " + providerId);
                }
                break;
            case "facebook":
                if (utilisateur.getFacebookId() == null) {
                    utilisateur.setFacebookId(providerId);
                }
                break;
            case "apple":
                if (utilisateur.getAppleId() == null) {
                    utilisateur.setAppleId(providerId);
                }
                break;
        }
    }

    /**
     * Met à jour les informations de l'utilisateur depuis le DTO OAuth2
     */
    private void mettreAJourInfosDTO(Utilisateur utilisateur, OAuth2UserInfoDTO userInfo) {
        // Mettre à jour la photo si elle a changé
        String newPhoto = userInfo.getPicture();
        if (newPhoto != null && !newPhoto.equals(utilisateur.getPhotoUrl())) {
            utilisateur.setPhotoUrl(newPhoto);
        }

        // Mettre à jour le nom si vide
        if (utilisateur.getNom() == null && userInfo.getFamilyName() != null) {
            utilisateur.setNom(userInfo.getFamilyName());
        }

        // Mettre à jour le prénom si vide
        if (utilisateur.getPrenom() == null && userInfo.getGivenName() != null) {
            utilisateur.setPrenom(userInfo.getGivenName());
        }
    }

    /**
     * Met à jour les informations de l'utilisateur depuis le provider OAuth
     */
    private void mettreAJourInfos(Utilisateur utilisateur, OidcUser oidcUser) {
        // Mettre à jour la photo si elle a changé
        String newPhoto = oidcUser.getPicture();
        if (newPhoto != null && !newPhoto.equals(utilisateur.getPhotoUrl())) {
            utilisateur.setPhotoUrl(newPhoto);
        }

        // Mettre à jour le nom si vide
        if (utilisateur.getNom() == null && oidcUser.getFamilyName() != null) {
            utilisateur.setNom(oidcUser.getFamilyName());
        }

        // Mettre à jour le prénom si vide
        if (utilisateur.getPrenom() == null && oidcUser.getGivenName() != null) {
            utilisateur.setPrenom(oidcUser.getGivenName());
        }
    }

    /**
     * Détermine le provider OAuth à partir du DTO
     */
    private String determinerProvider(OAuth2UserInfoDTO userInfo) {
        String issuer = userInfo.getIssuer();
        String identityProvider = userInfo.getIdentityProvider();

        if (identityProvider != null && !identityProvider.isEmpty()) {
            return identityProvider.toLowerCase();
        }

        if (issuer != null) {
            if (issuer.contains("google")) {
                return "google";
            } else if (issuer.contains("facebook")) {
                return "facebook";
            } else if (issuer.contains("apple")) {
                return "apple";
            } else if (issuer.contains("keycloak")) {
                return "keycloak";
            }
        }

        return "unknown";
    }

    /**
     * Récupérer un utilisateur par son email
     */
    public Optional<Utilisateur> trouverParEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    /**
     * Récupérer un utilisateur par son ID
     */
    public Optional<Utilisateur> trouverParId(String id) {
        return utilisateurRepository.findById(id);
    }

    /**
     * Inscription d'un nouvel utilisateur avec email et mot de passe
     * Crée l'utilisateur à la fois dans Keycloak et dans la base de données
     * L'email doit être vérifié avant que l'utilisateur puisse se connecter
     */
    @Transactional
    public Utilisateur inscrireAvecMotDePasse(String nom, String prenom, String email, String motDePasse) throws Exception {
        // Vérifier si l'utilisateur existe déjà
        if (utilisateurRepository.findByEmail(email).isPresent()) {
            throw new Exception("Un utilisateur avec cet email existe déjà");
        }

        // Créer l'utilisateur dans Keycloak (avec emailVerified = false)
        System.out.println("[AUTH SERVICE] Création de l'utilisateur dans Keycloak: " + email);
        String keycloakUserId = keycloakService.createUser(email, prenom, nom, motDePasse);

        if (keycloakUserId == null) {
            throw new Exception("Échec de la création de l'utilisateur dans Keycloak");
        }

        System.out.println("[AUTH SERVICE] Utilisateur créé dans Keycloak avec l'ID: " + keycloakUserId);

        // Créer l'utilisateur dans la base de données avec emailVerifie = false
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(email);
        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setMotDePasseHash(passwordEncoder.encode(motDePasse));
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateur.setActif(true);
        utilisateur.setEmailVerifie(false); // L'email n'est pas encore vérifié

        utilisateur = utilisateurRepository.save(utilisateur);
        System.out.println("[AUTH SERVICE] Utilisateur créé dans la base de données avec l'ID: " + utilisateur.getId());

        // Générer le token de vérification et envoyer l'email
        String token = tokenVerificationService.creerTokenPourUtilisateur(utilisateur);
        emailService.envoyerEmailVerification(email, prenom, nom, token);
        System.out.println("[AUTH SERVICE] Email de vérification envoyé à: " + email);

        return utilisateur;
    }

    /**
     * Connexion d'un utilisateur avec email et mot de passe
     * Vérifie les credentials dans Keycloak
     * Bloque si l'email n'est pas vérifié
     */
    @Transactional
    public Utilisateur connecterAvecMotDePasse(String email, String motDePasse) throws Exception {
        // Vérifier si l'utilisateur existe dans la base de données
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);

        if (utilisateurOpt.isEmpty()) {
            throw new Exception("Email ou mot de passe incorrect");
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        // Vérifier que l'email est vérifié
        if (!Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            throw new EmailNonVerifieException("Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte mail.");
        }

        // Validation du mot de passe
        System.out.println("[AUTH SERVICE] Validation des credentials pour: " + email);

        // Si motDePasseHash == null, c'est un utilisateur système → authentification Keycloak uniquement
        if (utilisateur.getMotDePasseHash() == null) {
            System.out.println("[AUTH SERVICE] Utilisateur système détecté, validation via Keycloak uniquement");
            boolean isValid = keycloakService.validateCredentials(email, motDePasse);

            if (!isValid) {
                throw new Exception("Email ou mot de passe incorrect");
            }
        } else {
            // Utilisateur normal : essayer Keycloak puis fallback BCrypt
            boolean isValid = keycloakService.validateCredentials(email, motDePasse);

            if (!isValid) {
                // Fallback: vérifier aussi avec BCrypt si Keycloak échoue
                if (!passwordEncoder.matches(motDePasse, utilisateur.getMotDePasseHash())) {
                    throw new Exception("Email ou mot de passe incorrect");
                }
            }
        }

        // Mettre à jour la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateur = utilisateurRepository.save(utilisateur);

        System.out.println("[AUTH SERVICE] Connexion réussie pour: " + email);
        return utilisateur;
    }

    /**
     * Exception spécifique pour email non vérifié
     */
    public static class EmailNonVerifieException extends Exception {
        public EmailNonVerifieException(String message) {
            super(message);
        }
    }

    /**
     * Changer le mot de passe d'un utilisateur
     * Met à jour le mot de passe dans Keycloak et dans la base de données locale
     */
    @Transactional
    public void changerMotDePasse(String userId, String motDePasseActuel, String nouveauMotDePasse) throws Exception {
        // Récupérer l'utilisateur
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(userId);

        if (utilisateurOpt.isEmpty()) {
            throw new Exception("Utilisateur non trouvé");
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        // Vérifier que l'utilisateur a un mot de passe défini (n'est pas un utilisateur OAuth)
        if (utilisateur.getMotDePasseHash() == null) {
            throw new Exception("Cet utilisateur n'a pas de mot de passe défini. Il utilise l'authentification sociale.");
        }

        // Vérifier le mot de passe actuel
        if (!passwordEncoder.matches(motDePasseActuel, utilisateur.getMotDePasseHash())) {
            throw new Exception("Le mot de passe actuel est incorrect");
        }

        // Mettre à jour dans Keycloak
        System.out.println("🔐 [AUTH SERVICE] Changement de mot de passe pour: " + utilisateur.getEmail());
        boolean keycloakSuccess = keycloakService.changerMotDePasse(utilisateur.getEmail(), nouveauMotDePasse);

        if (!keycloakSuccess) {
            System.out.println("⚠️ [AUTH SERVICE] Échec Keycloak, mise à jour locale uniquement");
        }

        // Mettre à jour dans la base de données locale
        utilisateur.setMotDePasseHash(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);

        System.out.println("✅ [AUTH SERVICE] Mot de passe changé avec succès pour: " + utilisateur.getEmail());
    }
}
