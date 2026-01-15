package com.intermediation.auth.service;

import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Service de gestion des tokens de vérification d'email.
 */
@Service
public class TokenVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(TokenVerificationService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final UtilisateurRepository utilisateurRepository;
    private final KeycloakService keycloakService;

    @Value("${app.verification.token-expiration-hours:72}")
    private int dureeExpirationHeures;

    public TokenVerificationService(UtilisateurRepository utilisateurRepository,
                                    KeycloakService keycloakService) {
        this.utilisateurRepository = utilisateurRepository;
        this.keycloakService = keycloakService;
    }

    /**
     * Génère un token de vérification unique et sécurisé.
     *
     * @return Token encodé en Base64 URL-safe
     */
    public String genererToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Crée et associe un token de vérification à un utilisateur.
     *
     * @param utilisateur L'utilisateur pour lequel créer le token
     * @return Le token généré
     */
    @Transactional
    public String creerTokenPourUtilisateur(Utilisateur utilisateur) {
        String token = genererToken();
        LocalDateTime dateExpiration = LocalDateTime.now().plusHours(dureeExpirationHeures);

        utilisateur.setTokenVerificationEmail(token);
        utilisateur.setDateExpirationToken(dateExpiration);
        utilisateurRepository.save(utilisateur);

        logger.info("Token de vérification créé pour l'utilisateur: {}", utilisateur.getEmail());
        return token;
    }

    /**
     * Vérifie un token de vérification et active le compte si valide.
     *
     * @param token Le token à vérifier
     * @return L'utilisateur si le token est valide, sinon Optional.empty()
     */
    @Transactional
    public Optional<Utilisateur> verifierToken(String token) {
        if (token == null || token.isBlank()) {
            logger.warn("Tentative de vérification avec un token vide");
            return Optional.empty();
        }

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByTokenVerificationEmail(token);

        if (utilisateurOpt.isEmpty()) {
            logger.warn("Token de vérification non trouvé: {}", token);
            return Optional.empty();
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        // Vérifier si le token n'a pas expiré
        if (utilisateur.getDateExpirationToken() == null ||
            utilisateur.getDateExpirationToken().isBefore(LocalDateTime.now())) {
            logger.warn("Token expiré pour l'utilisateur: {}", utilisateur.getEmail());
            return Optional.empty();
        }

        // Vérifier si l'email n'est pas déjà vérifié
        if (Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            logger.info("Email déjà vérifié pour l'utilisateur: {}", utilisateur.getEmail());
            return Optional.of(utilisateur);
        }

        // Valider l'email
        utilisateur.setEmailVerifie(true);
        utilisateur.setTokenVerificationEmail(null);
        utilisateur.setDateExpirationToken(null);
        utilisateurRepository.save(utilisateur);

        // Synchroniser avec Keycloak
        keycloakService.mettreAJourEmailVerifie(utilisateur.getEmail(), true);

        logger.info("Email vérifié avec succès pour l'utilisateur: {}", utilisateur.getEmail());
        return Optional.of(utilisateur);
    }

    /**
     * Vérifie si un token est valide (existe et non expiré) sans le consommer.
     *
     * @param token Le token à vérifier
     * @return true si le token est valide
     */
    public boolean estTokenValide(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByTokenVerificationEmail(token);

        if (utilisateurOpt.isEmpty()) {
            return false;
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        return utilisateur.getDateExpirationToken() != null &&
               utilisateur.getDateExpirationToken().isAfter(LocalDateTime.now());
    }

    /**
     * Renouvelle le token de vérification pour un utilisateur (si demande de renvoi).
     *
     * @param email Email de l'utilisateur
     * @return Le nouveau token, ou Optional.empty() si l'utilisateur n'existe pas ou est déjà vérifié
     */
    @Transactional
    public Optional<String> renouvelerToken(String email) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);

        if (utilisateurOpt.isEmpty()) {
            logger.warn("Tentative de renouvellement de token pour un email inexistant: {}", email);
            return Optional.empty();
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        if (Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            logger.info("Email déjà vérifié, pas besoin de renouveler le token: {}", email);
            return Optional.empty();
        }

        String nouveauToken = creerTokenPourUtilisateur(utilisateur);
        logger.info("Token renouvelé pour l'utilisateur: {}", email);
        return Optional.of(nouveauToken);
    }
}
