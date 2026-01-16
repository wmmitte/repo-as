package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.service.BadgeService;
import com.intermediation.expertise.service.TraitementDemandeService;
import com.intermediation.expertise.service.UtilisateurRhService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller pour le traitement des demandes de reconnaissance (côté traitant/admin)
 * ACCÈS RESTREINT :
 * - Disponibles : MANAGER uniquement
 * - Mes demandes : RH uniquement
 */
@RestController
@RequestMapping("/api/demandes-reconnaissance")
public class DemandeReconnaissanceController {

    private static final Logger logger = LoggerFactory.getLogger(DemandeReconnaissanceController.class);

    @Autowired
    private TraitementDemandeService traitementService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UtilisateurRhService utilisateurRhService;

    /**
     * Récupérer les demandes disponibles pour traitement
     * ACCÈS : MANAGER uniquement
     */
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getDemandesATraiter(
            @RequestHeader("X-User-Id") String traitantId,
            @RequestParam(value = "statut", required = false) StatutDemande statut) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = traitementService.getDemandesATraiter(traitantId, statut);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes à traiter", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Récupérer les demandes assignées
     * ACCÈS : RH uniquement
     */
    @GetMapping("/demandes")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> getDemandes(@RequestHeader("X-User-Id") String traitantId) {
        logger.info("🔍 [CONTROLLER] getDemandes - Header X-User-Id reçu: {}", traitantId);

        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = traitementService.getMesDemandes(traitantId);
            logger.info("✅ [CONTROLLER] Retour de {} demandes pour le RH {}", demandes.size(), traitantId);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes du traitant", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Récupérer les détails d'une demande
     * ACCÈS : MANAGER ou RH
     */
    @GetMapping("/{demandeId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> getDemandeDetails(@PathVariable Long demandeId) {
        try {
            DemandeReconnaissanceDTO demande = traitementService.getDemandeDetails(demandeId);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des détails de la demande", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * S'assigner une demande
     * ACCÈS : MANAGER ou RH
     */
    @PutMapping("/{demandeId}/assigner")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> assignerDemande(
            @RequestHeader("X-User-Id") String traitantId,
            @PathVariable Long demandeId) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.assignerDemande(demandeId, traitantId);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de l'assignation de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Évaluer une demande
     * ACCÈS : MANAGER ou RH
     */
    @PostMapping("/{demandeId}/evaluer")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> evaluerDemande(
            @RequestHeader("X-User-Id") String traitantId,
            @PathVariable Long demandeId,
            @Valid @RequestBody EvaluationRequest request) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            EvaluationCompetenceDTO evaluation = traitementService.evaluerDemande(demandeId, traitantId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
        } catch (Exception e) {
            logger.error("Erreur lors de l'évaluation de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Approuver une demande avec définition de la validité du badge
     * ACCÈS : MANAGER ou RH
     */
    @PutMapping("/{demandeId}/approuver")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> approuverDemande(
            @RequestHeader("X-User-Id") String traitantId,
            @PathVariable Long demandeId,
            @RequestBody(required = false) ApprobationRequest request) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            // Si le request est null, créer un objet par défaut (validité permanente)
            if (request == null) {
                request = new ApprobationRequest(null, true, null);
            }

            logger.info("=== Approbation RH - Données reçues ===");
            logger.info("validitePermanente: {}", request.getValiditePermanente());
            logger.info("dateExpiration: {}", request.getDateExpiration());
            logger.info("commentaire: {}", request.getCommentaire());

            // Valider les paramètres de validité
            request.valider();

            DemandeReconnaissanceDTO demande = traitementService.approuverDemande(
                demandeId,
                traitantId,
                request.getCommentaire(),
                request.getValiditePermanente(),
                request.getDateExpiration()
            );
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException e) {
            logger.error("Erreur de validation lors de l'approbation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Erreur lors de l'approbation de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Rejeter une demande
     * ACCÈS : MANAGER ou RH
     */
    @PutMapping("/{demandeId}/rejeter")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> rejeterDemande(
            @RequestHeader("X-User-Id") String traitantId,
            @PathVariable Long demandeId,
            @RequestBody String motif) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.rejeterDemande(demandeId, traitantId, motif);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors du rejet de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Demander des compléments d'information
     * ACCÈS : MANAGER ou RH
     */
    @PostMapping("/{demandeId}/complements")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> demanderComplement(
            @RequestHeader("X-User-Id") String traitantId,
            @PathVariable Long demandeId,
            @RequestBody String commentaire) {
        
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.demanderComplement(demandeId, traitantId, commentaire);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la demande de complément", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Marquer une pièce justificative comme vérifiée
     * ACCÈS : MANAGER ou RH
     */
    @PutMapping("/pieces/{pieceId}/verifier")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> marquerPieceVerifiee(@PathVariable Long pieceId) {
        try {
            PieceJustificativeDTO piece = traitementService.marquerPieceVerifiee(pieceId);
            return ResponseEntity.ok(piece);
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification de la pièce", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Obtenir les statistiques de traitement
     * ACCÈS : MANAGER ou RH
     */
    @GetMapping("/statistiques")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH')")
    public ResponseEntity<?> getStatistiques(@RequestHeader("X-User-Id") String traitantId) {
        try {
            StatistiquesTraitementDTO stats = traitementService.getStatistiques(traitantId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Révoquer un badge (admin uniquement)
     */
    @PutMapping("/badges/{badgeId}/revoquer")
    public ResponseEntity<?> revoquerBadge(
            @RequestHeader("X-User-Id") String adminId,
            @PathVariable Long badgeId,
            @RequestBody String motif) {

        if (adminId == null || adminId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            badgeService.revoquerBadge(badgeId, motif, adminId);
            return ResponseEntity.ok("Badge révoqué avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de la révocation du badge", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ========== NOUVEAUX ENDPOINTS POUR LE WORKFLOW MANAGER/RH ==========

    /**
     * Récupérer la liste des utilisateurs RH disponibles
     * ACCÈS : MANAGER uniquement
     */
    @GetMapping("/rh-disponibles")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getRhDisponibles() {
        try {
            logger.info("📞 Endpoint /rh-disponibles appelé");
            List<UtilisateurRhDTO> rhList = utilisateurRhService.getUtilisateursRhDisponibles();
            logger.info("✅ {} utilisateurs RH récupérés", rhList.size());
            return ResponseEntity.ok(rhList);
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des RH disponibles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Assigner une demande à un RH spécifique
     * ACCÈS : MANAGER uniquement
     */
    @PutMapping("/{demandeId}/assigner-rh")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> assignerDemandeAuRh(
            @RequestHeader("X-User-Id") String managerId,
            @PathVariable Long demandeId,
            @Valid @RequestBody AssignationRhRequest request) {

        logger.info("🔍 [CONTROLLER] assignerDemandeAuRh - managerId: {}, demandeId: {}, rhId: {}",
            managerId, demandeId, request.getRhId());

        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.assignerDemandeAuRh(
                demandeId,
                managerId,
                request.getRhId(),
                request.getCommentaire()
            );
            logger.info("✅ [CONTROLLER] Assignation réussie - demandeId: {}, rhId: {}", demandeId, request.getRhId());
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de l'assignation au RH", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Le RH soumet son évaluation au Manager
     * ACCÈS : RH uniquement
     */
    @PostMapping("/{demandeId}/soumettre-evaluation")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> soumettreEvaluationAuManager(
            @RequestHeader("X-User-Id") String rhId,
            @PathVariable Long demandeId) {

        if (rhId == null || rhId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.soumettreEvaluationAuManager(demandeId, rhId);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la soumission de l'évaluation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Récupérer les demandes en attente de validation (Manager)
     * ACCÈS : MANAGER uniquement
     */
    @GetMapping("/a-valider")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getDemandesAValider(@RequestHeader("X-User-Id") String managerId) {
        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = traitementService.getDemandesEnAttenteValidation(managerId);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes à valider", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Récupérer les demandes assignées aux RH (Manager)
     * ACCÈS : MANAGER uniquement
     */
    @GetMapping("/assignees")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getDemandesAssignees(@RequestHeader("X-User-Id") String managerId) {
        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = traitementService.getDemandesAssignees(managerId);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes assignées", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Approuver une demande (Manager)
     * ACCÈS : MANAGER uniquement
     */
    @PutMapping("/{demandeId}/approuver-manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> approuverDemandeParManager(
            @RequestHeader("X-User-Id") String managerId,
            @PathVariable Long demandeId,
            @RequestBody(required = false) ApprobationRequest request) {

        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            if (request == null) {
                request = new ApprobationRequest(null, true, null);
            }

            logger.info("=== Approbation Manager - Données reçues ===");
            logger.info("validitePermanente: {}", request.getValiditePermanente());
            logger.info("dateExpiration: {}", request.getDateExpiration());
            logger.info("commentaire: {}", request.getCommentaire());

            request.valider();

            DemandeReconnaissanceDTO demande = traitementService.approuverDemandeParManager(
                demandeId,
                managerId,
                request.getCommentaire(),
                request.getValiditePermanente(),
                request.getDateExpiration()
            );
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException e) {
            logger.error("Erreur de validation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Erreur lors de l'approbation par le manager", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Rejeter une demande (Manager)
     * ACCÈS : MANAGER uniquement
     */
    @PutMapping("/{demandeId}/rejeter-manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> rejeterDemandeParManager(
            @RequestHeader("X-User-Id") String managerId,
            @PathVariable Long demandeId,
            @RequestBody String motif) {

        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.rejeterDemandeParManager(demandeId, managerId, motif);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors du rejet par le manager", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Demander un complément (Manager)
     * ACCÈS : MANAGER uniquement
     */
    @PostMapping("/{demandeId}/complements-manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> demanderComplementParManager(
            @RequestHeader("X-User-Id") String managerId,
            @PathVariable Long demandeId,
            @RequestBody String commentaire) {

        if (managerId == null || managerId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = traitementService.demanderComplementParManager(demandeId, managerId, commentaire);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la demande de complément par le manager", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
