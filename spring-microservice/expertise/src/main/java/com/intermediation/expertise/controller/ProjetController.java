package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.ProjetService;
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
 * Controller REST pour la gestion des projets.
 */
@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private static final Logger log = LoggerFactory.getLogger(ProjetController.class);

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    /**
     * Créer un nouveau projet.
     */
    @PostMapping
    public ResponseEntity<ProjetDTO> creerProjet(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreerProjetRequest request) {
        log.info("POST /api/projets - Création d'un projet par {}", utilisateurId);
        ProjetDTO projet = projetService.creerProjet(utilisateurId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(projet);
    }

    /**
     * Modifier un projet existant.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjetDTO> modifierProjet(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody ModifierProjetRequest request) {
        log.info("PUT /api/projets/{} - Modification par {}", id, utilisateurId);
        ProjetDTO projet = projetService.modifierProjet(id, utilisateurId, request);
        return ResponseEntity.ok(projet);
    }

    /**
     * Obtenir un projet par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> obtenirProjet(@PathVariable Long id) {
        log.info("GET /api/projets/{}", id);
        ProjetDTO projet = projetService.obtenirProjetComplet(id);
        projetService.incrementerVues(id);
        return ResponseEntity.ok(projet);
    }

    /**
     * Lister mes projets (en tant que propriétaire).
     */
    @GetMapping("/mes-projets")
    public ResponseEntity<List<ProjetResumeDTO>> listerMesProjets(
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("GET /api/projets/mes-projets - Pour {}", utilisateurId);
        List<ProjetResumeDTO> projets = projetService.listerMesProjets(utilisateurId);
        return ResponseEntity.ok(projets);
    }

    /**
     * Publier un projet.
     */
    @PutMapping("/{id}/publier")
    public ResponseEntity<ProjetDTO> publierProjet(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("PUT /api/projets/{}/publier - Par {}", id, utilisateurId);
        ProjetDTO projet = projetService.publierProjet(id, utilisateurId);
        return ResponseEntity.ok(projet);
    }

    /**
     * Dépublier un projet.
     */
    @PutMapping("/{id}/depublier")
    public ResponseEntity<ProjetDTO> depublierProjet(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("PUT /api/projets/{}/depublier - Par {}", id, utilisateurId);
        ProjetDTO projet = projetService.depublierProjet(id, utilisateurId);
        return ResponseEntity.ok(projet);
    }

    /**
     * Changer le statut d'un projet.
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<ProjetDTO> changerStatut(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String nouveauStatut = body.get("statut");
        log.info("PUT /api/projets/{}/statut -> {} - Par {}", id, nouveauStatut, utilisateurId);
        ProjetDTO projet = projetService.changerStatut(id, utilisateurId, nouveauStatut);
        return ResponseEntity.ok(projet);
    }

    /**
     * Supprimer un projet.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerProjet(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/projets/{} - Par {}", id, utilisateurId);
        projetService.supprimerProjet(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Créer une étape dans un projet.
     */
    @PostMapping("/etapes")
    public ResponseEntity<EtapeProjetDTO> creerEtape(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreerEtapeRequest request) {
        log.info("POST /api/projets/etapes - Création d'une étape pour le projet {}", request.getProjetId());
        EtapeProjetDTO etape = projetService.creerEtape(utilisateurId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(etape);
    }

    /**
     * Supprimer une étape.
     */
    @DeleteMapping("/etapes/{id}")
    public ResponseEntity<Void> supprimerEtape(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/projets/etapes/{} - Par {}", id, utilisateurId);
        projetService.supprimerEtape(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajouter une exigence à un projet.
     */
    @PostMapping("/{projetId}/exigences")
    public ResponseEntity<ExigenceProjetDTO> ajouterExigence(
            @PathVariable Long projetId,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String description = body.get("description");
        log.info("POST /api/projets/{}/exigences - Par {}", projetId, utilisateurId);
        ExigenceProjetDTO exigence = projetService.ajouterExigence(projetId, utilisateurId, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(exigence);
    }

    /**
     * Supprimer une exigence.
     */
    @DeleteMapping("/exigences/{id}")
    public ResponseEntity<Void> supprimerExigence(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/projets/exigences/{} - Par {}", id, utilisateurId);
        projetService.supprimerExigence(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Endpoints publics ====================

    /**
     * Lister les projets publics (feed).
     */
    @GetMapping("/public")
    public ResponseEntity<Page<ProjetResumeDTO>> listerProjetsPublics(Pageable pageable) {
        log.info("GET /api/projets/public");
        Page<ProjetResumeDTO> projets = projetService.listerProjetsPublics(pageable);
        return ResponseEntity.ok(projets);
    }

    /**
     * Rechercher des projets publics.
     */
    @GetMapping("/public/recherche")
    public ResponseEntity<Page<ProjetResumeDTO>> rechercherProjetsPublics(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        log.info("GET /api/projets/public/recherche?q={}", q);
        Page<ProjetResumeDTO> projets = projetService.rechercherProjetsPublics(q, pageable);
        return ResponseEntity.ok(projets);
    }

    /**
     * Lister les projets avec des tâches disponibles.
     */
    @GetMapping("/public/avec-taches-disponibles")
    public ResponseEntity<Page<ProjetResumeDTO>> listerProjetsAvecTachesDisponibles(Pageable pageable) {
        log.info("GET /api/projets/public/avec-taches-disponibles");
        Page<ProjetResumeDTO> projets = projetService.listerProjetsAvecTachesDisponibles(pageable);
        return ResponseEntity.ok(projets);
    }
}
