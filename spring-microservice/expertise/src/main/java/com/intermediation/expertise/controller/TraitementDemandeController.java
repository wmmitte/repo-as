package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.service.BadgeService;
import com.intermediation.expertise.service.TraitementDemandeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour le traitement des demandes de reconnaissance (côté traitant/admin)
 */
@RestController
@RequestMapping("/api/traitement-demandes")
public class TraitementDemandeController {

    private static final Logger logger = LoggerFactory.getLogger(TraitementDemandeController.class);

    @Autowired
    private TraitementDemandeService traitementService;

    @Autowired
    private BadgeService badgeService;

    /**
     * Récupérer les demandes disponibles pour traitement
     */
    @GetMapping
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
     * Récupérer mes demandes assignées
     */
    @GetMapping("/mes-demandes")
    public ResponseEntity<?> getMesDemandes(@RequestHeader("X-User-Id") String traitantId) {
        if (traitantId == null || traitantId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = traitementService.getMesDemandes(traitantId);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes du traitant", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Récupérer les détails d'une demande
     */
    @GetMapping("/{demandeId}")
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
     */
    @PutMapping("/{demandeId}/assigner")
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
     */
    @PostMapping("/{demandeId}/evaluer")
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
     */
    @PutMapping("/{demandeId}/approuver")
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
     */
    @PutMapping("/{demandeId}/rejeter")
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
     */
    @PostMapping("/{demandeId}/complements")
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
     */
    @PutMapping("/pieces/{pieceId}/verifier")
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
     */
    @GetMapping("/statistiques")
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
}
