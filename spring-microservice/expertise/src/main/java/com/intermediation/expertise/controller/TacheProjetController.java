package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.TacheProjetService;
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
 * Controller REST pour la gestion des tâches de projet.
 */
@RestController
@RequestMapping("/api/taches")
public class TacheProjetController {

    private static final Logger log = LoggerFactory.getLogger(TacheProjetController.class);

    private final TacheProjetService tacheService;

    public TacheProjetController(TacheProjetService tacheService) {
        this.tacheService = tacheService;
    }

    /**
     * Créer une nouvelle tâche.
     */
    @PostMapping
    public ResponseEntity<TacheProjetDTO> creerTache(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreerTacheRequest request) {
        log.info("POST /api/taches - Création d'une tâche pour le projet {}", request.getProjetId());
        TacheProjetDTO tache = tacheService.creerTache(utilisateurId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tache);
    }

    /**
     * Modifier une tâche existante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TacheProjetDTO> modifierTache(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody ModifierTacheRequest request) {
        log.info("PUT /api/taches/{} - Modification par {}", id, utilisateurId);
        TacheProjetDTO tache = tacheService.modifierTache(id, utilisateurId, request);
        return ResponseEntity.ok(tache);
    }

    /**
     * Obtenir une tâche par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TacheProjetDTO> obtenirTache(@PathVariable Long id) {
        log.info("GET /api/taches/{}", id);
        TacheProjetDTO tache = tacheService.obtenirTacheComplete(id);
        return ResponseEntity.ok(tache);
    }

    /**
     * Lister les tâches d'un projet.
     */
    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<TacheProjetDTO>> listerTachesProjet(@PathVariable Long projetId) {
        log.info("GET /api/taches/projet/{}", projetId);
        List<TacheProjetDTO> taches = tacheService.listerTachesProjet(projetId);
        return ResponseEntity.ok(taches);
    }

    /**
     * Lister mes tâches assignées.
     */
    @GetMapping("/mes-taches")
    public ResponseEntity<List<TacheProjetDTO>> listerMesTaches(
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/taches/mes-taches - Pour {}", utilisateurId);
        List<TacheProjetDTO> taches = tacheService.listerMesTaches(utilisateurId);
        return ResponseEntity.ok(taches);
    }

    /**
     * Changer le statut d'une tâche.
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<TacheProjetDTO> changerStatut(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String nouveauStatut = body.get("statut");
        log.info("PUT /api/taches/{}/statut -> {} - Par {}", id, nouveauStatut, utilisateurId);
        TacheProjetDTO tache = tacheService.changerStatut(id, utilisateurId, nouveauStatut);
        return ResponseEntity.ok(tache);
    }

    /**
     * Assigner un expert à une tâche.
     */
    @PutMapping("/{id}/assigner")
    public ResponseEntity<TacheProjetDTO> assignerExpert(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String expertId = body.get("expertId");
        log.info("PUT /api/taches/{}/assigner - Expert {} par {}", id, expertId, utilisateurId);
        TacheProjetDTO tache = tacheService.assignerExpert(id, utilisateurId, expertId);
        return ResponseEntity.ok(tache);
    }

    /**
     * Désassigner un expert d'une tâche.
     */
    @PutMapping("/{id}/desassigner")
    public ResponseEntity<TacheProjetDTO> desassignerExpert(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("PUT /api/taches/{}/desassigner - Par {}", id, utilisateurId);
        TacheProjetDTO tache = tacheService.desassignerExpert(id, utilisateurId);
        return ResponseEntity.ok(tache);
    }

    /**
     * Supprimer une tâche.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerTache(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/taches/{} - Par {}", id, utilisateurId);
        tacheService.supprimerTache(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajouter un livrable à une tâche.
     */
    @PostMapping("/{id}/livrables")
    public ResponseEntity<LivrableTacheDTO> ajouterLivrable(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String nom = body.get("nom");
        String description = body.get("description");
        log.info("POST /api/taches/{}/livrables - Par {}", id, utilisateurId);
        LivrableTacheDTO livrable = tacheService.ajouterLivrable(id, utilisateurId, nom, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(livrable);
    }

    /**
     * Ajouter un commentaire à une tâche.
     */
    @PostMapping("/commentaires")
    public ResponseEntity<CommentaireTacheDTO> ajouterCommentaire(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreerCommentaireRequest request) {
        log.info("POST /api/taches/commentaires - Tâche {} par {}", request.getTacheId(), utilisateurId);
        CommentaireTacheDTO commentaire = tacheService.ajouterCommentaire(utilisateurId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentaire);
    }

    /**
     * Lister les commentaires d'une tâche.
     */
    @GetMapping("/{id}/commentaires")
    public ResponseEntity<List<CommentaireTacheDTO>> listerCommentaires(@PathVariable Long id) {
        log.info("GET /api/taches/{}/commentaires", id);
        List<CommentaireTacheDTO> commentaires = tacheService.listerCommentaires(id);
        return ResponseEntity.ok(commentaires);
    }

    // ==================== Endpoints publics ====================

    /**
     * Lister les tâches disponibles (publiques, non assignées).
     */
    @GetMapping("/disponibles")
    public ResponseEntity<Page<TacheProjetDTO>> listerTachesDisponibles(Pageable pageable) {
        log.info("GET /api/taches/disponibles");
        Page<TacheProjetDTO> taches = tacheService.listerTachesDisponibles(pageable);
        return ResponseEntity.ok(taches);
    }

    /**
     * Lister les tâches disponibles par compétences.
     */
    @GetMapping("/disponibles/par-competences")
    public ResponseEntity<Page<TacheProjetDTO>> listerTachesDisponiblesParCompetences(
            @RequestParam List<Long> competenceIds,
            Pageable pageable) {
        log.info("GET /api/taches/disponibles/par-competences?competenceIds={}", competenceIds);
        Page<TacheProjetDTO> taches = tacheService.listerTachesDisponiblesParCompetences(competenceIds, pageable);
        return ResponseEntity.ok(taches);
    }
}
