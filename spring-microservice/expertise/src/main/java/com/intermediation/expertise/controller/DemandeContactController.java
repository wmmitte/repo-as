package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.CreerDemandeContactRequest;
import com.intermediation.expertise.dto.DemandeContactDTO;
import com.intermediation.expertise.security.SecurityService;
import com.intermediation.expertise.service.DemandeContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller pour la gestion des demandes de contact entre experts
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
public class DemandeContactController {

    private final DemandeContactService demandeContactService;
    private final SecurityService securityService;

    /**
     * Envoyer une demande de contact à un expert
     */
    @PostMapping("/{destinataireId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> envoyerDemandeContact(
            @PathVariable String destinataireId,
            @RequestHeader("X-User-Id") String expediteurId,
            @Valid @RequestBody CreerDemandeContactRequest request) {

        log.info("Demande de contact de {} vers {}", expediteurId, destinataireId);

        // Vérification ownership
        if (!securityService.isOwner(expediteurId)) {
            log.warn("Tentative d'envoi de contact refusée pour l'utilisateur {}", expediteurId);
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        try {
            DemandeContactDTO demande = demandeContactService.creerDemandeContact(expediteurId, destinataireId, request);
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de la demande de contact", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Erreur lors de l'envoi du message"));
        }
    }

    /**
     * Récupérer les demandes envoyées
     */
    @GetMapping("/envoyees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeContactDTO>> getDemandesEnvoyees(
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<DemandeContactDTO> demandes = demandeContactService.getDemandesEnvoyees(utilisateurId);
        return ResponseEntity.ok(demandes);
    }

    /**
     * Récupérer les demandes reçues
     */
    @GetMapping("/recues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeContactDTO>> getDemandesRecues(
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<DemandeContactDTO> demandes = demandeContactService.getDemandesRecues(utilisateurId);
        return ResponseEntity.ok(demandes);
    }

    /**
     * Récupérer les demandes non lues
     */
    @GetMapping("/non-lues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeContactDTO>> getDemandesNonLues(
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<DemandeContactDTO> demandes = demandeContactService.getDemandesNonLues(utilisateurId);
        return ResponseEntity.ok(demandes);
    }

    /**
     * Compter les demandes non lues
     */
    @GetMapping("/non-lues/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> compterDemandesNonLues(
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).body(Map.of("count", 0L));
        }

        long count = demandeContactService.compterDemandesNonLues(utilisateurId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Récupérer une demande par son ID
     */
    @GetMapping("/{demandeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDemandeById(
            @PathVariable Long demandeId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        try {
            DemandeContactDTO demande = demandeContactService.getDemandeById(demandeId, utilisateurId);
            return ResponseEntity.ok(demande);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Marquer une demande comme lue
     */
    @PutMapping("/{demandeId}/lue")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> marquerCommeLue(
            @PathVariable Long demandeId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        try {
            DemandeContactDTO demande = demandeContactService.marquerCommeLue(demandeId, utilisateurId);
            return ResponseEntity.ok(demande);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Archiver une demande
     */
    @DeleteMapping("/{demandeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> archiverDemande(
            @PathVariable Long demandeId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        try {
            demandeContactService.archiverDemande(demandeId, utilisateurId);
            return ResponseEntity.ok(Map.of("message", "Demande archivée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}
