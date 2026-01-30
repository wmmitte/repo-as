package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.CandidatureProjetService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST pour la gestion des candidatures sur les projets.
 */
@RestController
@RequestMapping("/api/candidatures")
public class CandidatureProjetController {

    private static final Logger log = LoggerFactory.getLogger(CandidatureProjetController.class);

    private final CandidatureProjetService candidatureService;

    public CandidatureProjetController(CandidatureProjetService candidatureService) {
        this.candidatureService = candidatureService;
    }

    /**
     * Créer une candidature sur un projet ou une tâche.
     */
    @PostMapping
    public ResponseEntity<CandidatureProjetDTO> creerCandidature(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreerCandidatureRequest request) {
        log.info("POST /api/candidatures - Candidature par {} sur le projet {}", utilisateurId, request.getProjetId());
        CandidatureProjetDTO candidature = candidatureService.creerCandidature(utilisateurId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(candidature);
    }

    /**
     * Obtenir une candidature par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CandidatureProjetDTO> obtenirCandidature(@PathVariable Long id) {
        log.info("GET /api/candidatures/{}", id);
        CandidatureProjetDTO candidature = candidatureService.obtenirCandidature(id);
        return ResponseEntity.ok(candidature);
    }

    /**
     * Lister mes candidatures (en tant qu'expert).
     */
    @GetMapping("/mes-candidatures")
    public ResponseEntity<List<CandidatureProjetDTO>> listerMesCandidatures(
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/candidatures/mes-candidatures - Pour {}", utilisateurId);
        List<CandidatureProjetDTO> candidatures = candidatureService.listerMesCandidatures(utilisateurId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Lister mes candidatures avec pagination.
     */
    @GetMapping("/mes-candidatures/page")
    public ResponseEntity<Page<CandidatureProjetDTO>> listerMesCandidaturesPaginees(
            @RequestHeader("X-User-Id") String utilisateurId,
            Pageable pageable) {
        log.info("GET /api/candidatures/mes-candidatures/page - Pour {}", utilisateurId);
        Page<CandidatureProjetDTO> candidatures = candidatureService.listerMesCandidatures(utilisateurId, pageable);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Lister les candidatures sur un projet (pour le propriétaire).
     */
    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<CandidatureProjetDTO>> listerCandidaturesProjet(
            @PathVariable Long projetId,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/candidatures/projet/{} - Par {}", projetId, utilisateurId);
        List<CandidatureProjetDTO> candidatures = candidatureService.listerCandidaturesProjet(projetId, utilisateurId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Lister les candidatures sur une tâche (pour le propriétaire).
     */
    @GetMapping("/tache/{tacheId}")
    public ResponseEntity<List<CandidatureProjetDTO>> listerCandidaturesTache(
            @PathVariable Long tacheId,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/candidatures/tache/{} - Par {}", tacheId, utilisateurId);
        List<CandidatureProjetDTO> candidatures = candidatureService.listerCandidaturesTache(tacheId, utilisateurId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Lister les candidatures en attente (pour le propriétaire).
     */
    @GetMapping("/en-attente")
    public ResponseEntity<List<CandidatureProjetDTO>> listerCandidaturesEnAttente(
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/candidatures/en-attente - Pour {}", utilisateurId);
        List<CandidatureProjetDTO> candidatures = candidatureService.listerCandidaturesEnAttente(utilisateurId);
        return ResponseEntity.ok(candidatures);
    }

    /**
     * Compter les candidatures en attente.
     */
    @GetMapping("/en-attente/count")
    public ResponseEntity<Map<String, Long>> compterCandidaturesEnAttente(
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/candidatures/en-attente/count - Pour {}", utilisateurId);
        long count = candidatureService.compterCandidaturesEnAttente(utilisateurId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Répondre à une candidature (accepter, refuser, mettre en discussion).
     */
    @PutMapping("/{id}/repondre")
    public ResponseEntity<CandidatureProjetDTO> repondreCandidature(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody RepondreCandidatureRequest request) {
        log.info("PUT /api/candidatures/{}/repondre - Action {} par {}", id, request.getAction(), utilisateurId);
        CandidatureProjetDTO candidature = candidatureService.repondreCandidature(id, utilisateurId, request);
        return ResponseEntity.ok(candidature);
    }

    /**
     * Retirer une candidature (par l'expert).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> retirerCandidature(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/candidatures/{} - Par {}", id, utilisateurId);
        candidatureService.retirerCandidature(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }
}
