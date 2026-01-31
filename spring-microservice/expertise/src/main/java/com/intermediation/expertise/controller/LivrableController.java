package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.FileStorageService;
import com.intermediation.expertise.service.LivrableService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private final FileStorageService fileStorageService;

    public LivrableController(LivrableService livrableService, FileStorageService fileStorageService) {
        this.livrableService = livrableService;
        this.fileStorageService = fileStorageService;
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
     * Uploader un fichier pour un livrable (par l'expert).
     * Retourne l'URL du fichier uploadé.
     */
    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploaderFichierLivrable(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestParam("fichier") MultipartFile fichier) {
        log.info("POST /api/livrables/{}/upload - Par {}", id, utilisateurId);

        try {
            // Récupérer le livrable pour vérifier les autorisations et obtenir la tâche ID
            LivrableTacheDTO livrable = livrableService.obtenirLivrable(id);

            // Stocker le fichier
            String cheminFichier = fileStorageService.storeLivrableFile(fichier, livrable.getTacheId(), id);

            // Retourner les infos du fichier uploadé
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("fichierUrl", cheminFichier);
            response.put("fichierNom", fichier.getOriginalFilename());
            response.put("fichierTaille", fichier.getSize());
            response.put("fichierType", fichier.getContentType());

            log.info("Fichier uploadé pour le livrable {}: {}", id, cheminFichier);
            return ResponseEntity.ok(response);

        } catch (java.io.IOException e) {
            log.error("Erreur lors de l'upload du fichier pour le livrable {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erreur", e.getMessage()));
        }
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

    /**
     * Ajouter un critère d'acceptation à un livrable.
     */
    @PostMapping("/{id}/criteres")
    public ResponseEntity<CritereAcceptationLivrableDTO> ajouterCritere(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestBody Map<String, String> body) {
        String description = body.get("description");
        log.info("POST /api/livrables/{}/criteres - Par {}", id, utilisateurId);
        CritereAcceptationLivrableDTO critere = livrableService.ajouterCritere(id, utilisateurId, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(critere);
    }

    /**
     * Supprimer un critère d'acceptation.
     */
    @DeleteMapping("/criteres/{critereId}")
    public ResponseEntity<Void> supprimerCritere(
            @PathVariable Long critereId,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/livrables/criteres/{} - Par {}", critereId, utilisateurId);
        livrableService.supprimerCritere(critereId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Supprimer un livrable et tous ses critères.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerLivrable(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String utilisateurId) {
        log.info("DELETE /api/livrables/{} - Par {}", id, utilisateurId);
        livrableService.supprimerLivrable(id, utilisateurId);
        return ResponseEntity.noContent().build();
    }
}
