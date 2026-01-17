package com.intermediation.expertise.config;

import com.intermediation.expertise.service.ScoreExpertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Composant d'initialisation des scores au démarrage de l'application.
 * Calcule les scores pour tous les experts qui n'ont pas encore de score.
 */
@Component
public class ScoreInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ScoreInitializer.class);

    private final ScoreExpertService scoreExpertService;

    public ScoreInitializer(ScoreExpertService scoreExpertService) {
        this.scoreExpertService = scoreExpertService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("=== INITIALISATION DES SCORES DES EXPERTS ===");
        try {
            scoreExpertService.recalculerTousLesScores();
            log.info("=== INITIALISATION DES SCORES TERMINÉE ===");
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation des scores: {}", e.getMessage(), e);
        }
    }
}
