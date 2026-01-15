package com.intermediation.expertise.scheduler;

import com.intermediation.expertise.service.BadgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Tâche planifiée pour la gestion automatique de l'expiration des badges
 */
@Component
public class BadgeExpirationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(BadgeExpirationScheduler.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Autowired
    private BadgeService badgeService;

    /**
     * Désactive automatiquement les badges expirés
     * S'exécute tous les jours à 00:00 (minuit)
     *
     * Expression cron: "0 0 0 * * *"
     * - Seconde: 0
     * - Minute: 0
     * - Heure: 0 (minuit)
     * - Jour du mois: * (tous les jours)
     * - Mois: * (tous les mois)
     * - Jour de la semaine: * (tous les jours de la semaine)
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void desactiverBadgesExpiresAutomatiquement() {
        String dateExecution = LocalDateTime.now().format(formatter);
        logger.info("╔════════════════════════════════════════════════════════════════╗");
        logger.info("║  TÂCHE PLANIFIÉE: Désactivation des badges expirés           ║");
        logger.info("║  Heure d'exécution: {}                         ║", dateExecution);
        logger.info("╚════════════════════════════════════════════════════════════════╝");

        try {
            badgeService.desactiverBadgesExpires();
            logger.info("✓ Tâche de désactivation des badges expirés terminée avec succès");
        } catch (Exception e) {
            logger.error("✗ Erreur lors de la désactivation des badges expirés: {}", e.getMessage(), e);
        }

        logger.info("════════════════════════════════════════════════════════════════");
    }

    /**
     * Tâche de test qui s'exécute toutes les 5 minutes
     * (Utile pour le développement - peut être commentée en production)
     *
     * Pour activer cette tâche de test, décommentez l'annotation @Scheduled ci-dessous
     */
    // @Scheduled(fixedRate = 300000) // 300000 ms = 5 minutes
    public void desactiverBadgesExpiresTest() {
        logger.debug("[TEST] Vérification des badges expirés (exécution toutes les 5 minutes)");
        try {
            badgeService.desactiverBadgesExpires();
            logger.debug("[TEST] ✓ Vérification terminée");
        } catch (Exception e) {
            logger.error("[TEST] ✗ Erreur lors de la vérification: {}", e.getMessage(), e);
        }
    }
}
