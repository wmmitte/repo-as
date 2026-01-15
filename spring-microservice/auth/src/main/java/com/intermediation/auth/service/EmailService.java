package com.intermediation.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service d'envoi d'emails pour la vérification des comptes utilisateurs.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@intermediation.com}")
    private String emailFrom;

    @Value("${app.mail.from-name:Plateforme Intermediation}")
    private String emailFromName;

    @Value("${app.verification.base-url:http://localhost:8090}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * Envoie un email de vérification à l'utilisateur nouvellement inscrit.
     *
     * @param destinataire Email du destinataire
     * @param prenom       Prénom de l'utilisateur
     * @param nom          Nom de l'utilisateur
     * @param token        Token de vérification unique
     */
    public void envoyerEmailVerification(String destinataire, String prenom, String nom, String token) {
        try {
            String lienVerification = baseUrl + "/verifier-email?token=" + token;

            Context context = new Context();
            context.setVariable("prenom", prenom);
            context.setVariable("nom", nom);
            context.setVariable("lienVerification", lienVerification);
            context.setVariable("dureeValidite", "72 heures");

            String contenuHtml = templateEngine.process("email-verification", context);

            envoyerEmail(destinataire, "Vérifiez votre adresse email", contenuHtml);

            logger.info("Email de vérification envoyé à: {}", destinataire);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de vérification à {}: {}", destinataire, e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email de vérification", e);
        }
    }

    /**
     * Envoie un email de confirmation après validation réussie.
     *
     * @param destinataire Email du destinataire
     * @param prenom       Prénom de l'utilisateur
     */
    public void envoyerEmailConfirmation(String destinataire, String prenom) {
        try {
            Context context = new Context();
            context.setVariable("prenom", prenom);
            context.setVariable("lienConnexion", baseUrl);

            String contenuHtml = templateEngine.process("email-confirmation", context);

            envoyerEmail(destinataire, "Votre email a été vérifié avec succès", contenuHtml);

            logger.info("Email de confirmation envoyé à: {}", destinataire);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de confirmation à {}: {}", destinataire, e.getMessage());
            // Ne pas lever d'exception pour la confirmation, ce n'est pas bloquant
        }
    }

    /**
     * Méthode générique pour envoyer un email HTML.
     */
    private void envoyerEmail(String destinataire, String sujet, String contenuHtml) throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(emailFrom, emailFromName);
        helper.setTo(destinataire);
        helper.setSubject(sujet);
        helper.setText(contenuHtml, true);

        mailSender.send(message);
    }
}
