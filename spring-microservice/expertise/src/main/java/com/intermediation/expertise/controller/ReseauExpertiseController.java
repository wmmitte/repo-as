package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.ExpertPublicDTO;
import com.intermediation.expertise.security.SecurityService;
import com.intermediation.expertise.service.ReseauExpertiseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expertise/reseau")
@RequiredArgsConstructor
@Slf4j
public class ReseauExpertiseController {

    private final ReseauExpertiseService reseauService;
    private final SecurityService securityService;
    
    /**
     * Ajouter un expert au réseau
     * Réservé aux Experts pour gérer LEUR réseau
     */
    @PostMapping("/{expertId}")
    @PreAuthorize("hasRole('expert')")
    public ResponseEntity<Map<String, String>> ajouterAuReseau(
            @PathVariable String expertId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        log.info("Demande d'ajout de l'expert {} au réseau de l'utilisateur {}", expertId, utilisateurId);

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            log.warn("Tentative d'ajout au réseau refusée pour l'utilisateur {}", utilisateurId);
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        reseauService.ajouterAuReseau(utilisateurId, expertId);
        return ResponseEntity.ok(Map.of("message", "Expert ajouté au réseau avec succès"));
    }

    /**
     * Retirer un expert du réseau
     * Réservé aux Experts pour gérer LEUR réseau
     */
    @DeleteMapping("/{expertId}")
    @PreAuthorize("hasRole('expert')")
    public ResponseEntity<Map<String, String>> retirerDuReseau(
            @PathVariable String expertId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        log.info("Demande de retrait de l'expert {} du réseau de l'utilisateur {}", expertId, utilisateurId);

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            log.warn("Tentative de retrait du réseau refusée pour l'utilisateur {}", utilisateurId);
            return ResponseEntity.status(403).body(Map.of("message", "Accès refusé"));
        }

        reseauService.retirerDuReseau(utilisateurId, expertId);
        return ResponseEntity.ok(Map.of("message", "Expert retiré du réseau"));
    }

    /**
     * Vérifier si un expert est dans le réseau
     * Réservé aux Experts pour consulter LEUR réseau
     */
    @GetMapping("/{expertId}/est-dans-reseau")
    @PreAuthorize("hasRole('expert')")
    public ResponseEntity<Map<String, Boolean>> verifierSiDansReseau(
            @PathVariable String expertId,
            @RequestHeader("X-User-Id") String utilisateurId) {

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).body(Map.of("estDansReseau", false));
        }

        boolean estDansReseau = reseauService.estDansReseau(utilisateurId, expertId);
        return ResponseEntity.ok(Map.of("estDansReseau", estDansReseau));
    }

    /**
     * Récupérer tous les experts du réseau
     * Réservé aux Experts pour voir LEUR réseau
     */
    @GetMapping
    @PreAuthorize("hasRole('expert')")
    public ResponseEntity<List<ExpertPublicDTO>> getExpertsDuReseau(
            @RequestHeader("X-User-Id") String utilisateurId) {

        log.info("Récupération des experts du réseau de l'utilisateur {}", utilisateurId);

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            log.warn("Tentative d'accès au réseau refusée pour l'utilisateur {}", utilisateurId);
            return ResponseEntity.status(403).build();
        }

        List<ExpertPublicDTO> experts = reseauService.getExpertsDuReseau(utilisateurId);
        return ResponseEntity.ok(experts);
    }

    /**
     * Récupérer les IDs des experts du réseau
     * Réservé aux Experts pour voir LEUR réseau
     */
    @GetMapping("/ids")
    @PreAuthorize("hasRole('expert')")
    public ResponseEntity<List<String>> getExpertIdsDuReseau(
            @RequestHeader("X-User-Id") String utilisateurId) {

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<String> ids = reseauService.getExpertIdsDuReseau(utilisateurId);
        return ResponseEntity.ok(ids);
    }
}
