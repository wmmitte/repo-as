package com.intermediation.expertise.controller;

import com.intermediation.expertise.service.ScoreExpertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur pour la gestion des scores des experts
 */
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private static final Logger log = LoggerFactory.getLogger(ScoreController.class);

    private final ScoreExpertService scoreExpertService;

    public ScoreController(ScoreExpertService scoreExpertService) {
        this.scoreExpertService = scoreExpertService;
    }

    /**
     * Recalculer le score d'un expert spécifique
     * POST /api/scores/recalculer/{utilisateurId}
     */
    @PostMapping("/recalculer/{utilisateurId}")
    public ResponseEntity<Map<String, String>> recalculerScore(@PathVariable String utilisateurId) {
        log.info("Recalcul du score demandé pour l'utilisateur: {}", utilisateurId);
        scoreExpertService.calculerEtMettreAJourScore(utilisateurId);
        return ResponseEntity.ok(Map.of(
            "message", "Score recalculé avec succès",
            "utilisateurId", utilisateurId
        ));
    }

    /**
     * Recalculer tous les scores (admin)
     * POST /api/scores/recalculer-tous
     */
    @PostMapping("/recalculer-tous")
    public ResponseEntity<Map<String, String>> recalculerTousLesScores() {
        log.info("Recalcul de tous les scores demandé");
        scoreExpertService.recalculerTousLesScores();
        return ResponseEntity.ok(Map.of(
            "message", "Recalcul de tous les scores lancé"
        ));
    }

    /**
     * Recalculer tous les scores (admin) - Version GET pour appel facile depuis navigateur
     * GET /api/scores/initialiser
     */
    @GetMapping("/initialiser")
    public ResponseEntity<Map<String, String>> initialiserTousLesScores() {
        log.info("Initialisation de tous les scores demandée via GET");
        scoreExpertService.recalculerTousLesScores();
        return ResponseEntity.ok(Map.of(
            "message", "Initialisation de tous les scores terminée"
        ));
    }
}
