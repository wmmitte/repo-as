package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.LivrableService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST pour la gestion des livrables.
 */
@RestController
@RequestMapping("/api/livrables")
public class LivrableController {

    private static final Logger log = LoggerFactory.getLogger(LivrableController.class);

    private final LivrableService livrableService;

    public LivrableController(LivrableService livrableService) {
        this.livrableService = livrableService;
    }

    /**
     * Obtenir un livrable par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LivrableTacheDTO> obtenirLivrable(@PathVariable Long id) {
        log.info("GET /api/livrables/{}", id);
        LivrableTacheDTO livrable = livrableService.obtenirLivrable(id);
        return ResponseEntity.ok(livrable);
    }

    /**
     * Lister les livrables d'une tâche.
     */
    @GetMapping("/tache/{tacheId}")
    public ResponseEntity<List<LivrableTacheDTO>> listerLivrablesTache(@PathVariable Long tacheId) {
        log.info("GET /api/livrables/tache/{}", tacheId);
        List<LivrableTacheDTO> livrables = livrableService.listerLivrablesTache(tacheId);
        return ResponseEntity.ok(livrables);
    }

    /**
     * Lister les livrables en attente de validation pour un projet.
     */
    @GetMapping("/projet/{projetId}/en-attente")
    public ResponseEntity<List<LivrableTacheDTO>> listerLivrablesEnAttenteValidation(
            @PathVariable Long projetId) {
        log.info("GET /api/livrables/projet/{}/en-attente", projetId);
        List<LivrableTacheDTO> livrables = livrableService.listerLivrablesEnAttenteValidation(projetId);
        return ResponseEntity.ok(livrables);
    }

    /**
     * Soumettre un livrable (par l'expert).
     */
    @PutMapping("/{id}/soumettre")
    public ResponseEntity<LivrableTacheDTO> soumettreLivrable(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody SoumettreLivrableRequest request) {
        log.info("PUT /api/livrables/{}/soumettre - Par {}", id, utilisateurId);
        LivrableTacheDTO livrable = livrableService.soumettreLivrable(id, utilisateurId, request);
        return ResponseEntity.ok(livrable);
    }

    /**
     * Valider un livrable (par le propriétaire).
     */
    @PutMapping("/{id}/valider")
    public ResponseEntity<LivrableTacheDTO> validerLivrable(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody ValiderLivrableRequest request) {
        log.info("PUT /api/livrables/{}/valider - Accepté: {} par {}", id, request.getAccepte(), utilisateurId);
        LivrableTacheDTO livrable = livrableService.validerLivrable(id, utilisateurId, request);
        return ResponseEntity.ok(livrable);
    }

    /**
     * Demander une révision d'un livrable.
     */
    @PutMapping("/{id}/revision")
    public ResponseEntity<LivrableTacheDTO> demanderRevision(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String commentaire = body.get("commentaire");
        log.info("PUT /api/livrables/{}/revision - Par {}", id, utilisateurId);
        LivrableTacheDTO livrable = livrableService.demanderRevision(id, utilisateurId, commentaire);
        return ResponseEntity.ok(livrable);
    }

    /**
     * Compter les livrables par statut pour une tâche.
     */
    @GetMapping("/tache/{tacheId}/count")
    public ResponseEntity<Map<String, Long>> compterLivrables(
            @PathVariable Long tacheId,
            @RequestParam(required = false) String statut) {
        log.info("GET /api/livrables/tache/{}/count?statut={}", tacheId, statut);
        long count;
        if (statut != null) {
            count = livrableService.compterLivrablesParStatut(tacheId, statut);
        } else {
            count = livrableService.listerLivrablesTache(tacheId).size();
        }
        return ResponseEntity.ok(Map.of("count", count));
    }
}
