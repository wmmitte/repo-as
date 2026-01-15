package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.PieceJustificative;
import com.intermediation.expertise.service.BadgeService;
import com.intermediation.expertise.service.ReconnaissanceCompetenceService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Controller pour la gestion des demandes de reconnaissance de compétence (côté expert)
 */
@RestController
@RequestMapping("/api/reconnaissance-competences")
public class ReconnaissanceCompetenceController {

    private static final Logger logger = LoggerFactory.getLogger(ReconnaissanceCompetenceController.class);

    @Autowired
    private ReconnaissanceCompetenceService reconnaissanceService;

    @Autowired
    private BadgeService badgeService;

    /**
     * Soumettre une nouvelle demande de reconnaissance
     */
    @PostMapping
    public ResponseEntity<?> soumettreDemande(
            @RequestHeader("X-User-Id") String utilisateurId,
            @Valid @RequestBody CreateDemandeReconnaissanceRequest request) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = reconnaissanceService.soumettreDemande(utilisateurId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la soumission de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Ajouter une pièce justificative à une demande
     */
    @PostMapping("/{demandeId}/pieces")
    public ResponseEntity<?> ajouterPieceJustificative(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long demandeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("typePiece") PieceJustificative.TypePiece typePiece,
            @RequestParam(value = "description", required = false) String description) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            PieceJustificativeDTO piece = reconnaissanceService.ajouterPieceJustificative(
                utilisateurId, demandeId, file, typePiece, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(piece);
        } catch (IOException e) {
            logger.error("Erreur lors de l'ajout de la pièce justificative", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors du téléchargement du fichier");
        } catch (Exception e) {
            logger.error("Erreur lors de l'ajout de la pièce justificative", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Récupérer mes demandes de reconnaissance
     */
    @GetMapping("/mes-demandes")
    public ResponseEntity<?> getMesDemandes(@RequestHeader("X-User-Id") String utilisateurId) {
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<DemandeReconnaissanceDTO> demandes = reconnaissanceService.getMesDemandes(utilisateurId);
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des demandes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Récupérer les détails d'une demande
     */
    @GetMapping("/{demandeId}")
    public ResponseEntity<?> getDemandeDetails(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long demandeId) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = reconnaissanceService.getDemandeDetails(utilisateurId, demandeId);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des détails de la demande", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Annuler une demande
     */
    @PutMapping("/{demandeId}/annuler")
    public ResponseEntity<?> annulerDemande(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long demandeId) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            reconnaissanceService.annulerDemande(utilisateurId, demandeId);
            return ResponseEntity.ok("Demande annulée avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de l'annulation de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Resoumettre une demande après complément
     */
    @PutMapping("/{demandeId}/resoumettre")
    public ResponseEntity<?> resoumettreApresComplement(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long demandeId,
            @RequestBody(required = false) String nouveauCommentaire) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            DemandeReconnaissanceDTO demande = reconnaissanceService.resoumettreApresComplement(
                utilisateurId, demandeId, nouveauCommentaire);
            return ResponseEntity.ok(demande);
        } catch (Exception e) {
            logger.error("Erreur lors de la resoumission de la demande", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Supprimer une pièce justificative
     */
    @DeleteMapping("/{demandeId}/pieces/{pieceId}")
    public ResponseEntity<?> supprimerPiece(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long demandeId,
            @PathVariable Long pieceId) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            reconnaissanceService.supprimerPiece(utilisateurId, demandeId, pieceId);
            return ResponseEntity.ok("Pièce justificative supprimée avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de la pièce", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Récupérer mes badges
     */
    @GetMapping("/badges/mes-badges")
    public ResponseEntity<?> getMesBadges(
            @RequestHeader("X-User-Id") String utilisateurId,
            @RequestParam(value = "actifSeulement", defaultValue = "true") Boolean actifSeulement) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            List<BadgeCompetenceDTO> badges = badgeService.getMesBadges(utilisateurId, actifSeulement);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des badges", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Modifier la visibilité publique d'un badge
     */
    @PutMapping("/badges/{badgeId}/visibilite")
    public ResponseEntity<?> toggleVisibiliteBadge(
            @RequestHeader("X-User-Id") String utilisateurId,
            @PathVariable Long badgeId) {
        
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }

        try {
            BadgeCompetenceDTO badge = badgeService.toggleVisibilitePublique(utilisateurId, badgeId);
            return ResponseEntity.ok(badge);
        } catch (Exception e) {
            logger.error("Erreur lors de la modification de la visibilité du badge", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Définir l'ordre d'affichage des badges
     */
    @PutMapping("/badges/ordre")
    public ResponseEntity<Void> definirOrdreBadges(
            @RequestBody List<Long> badgeIds,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // TODO: Implémenter l'ordre des badges si nécessaire
        return ResponseEntity.ok().build();
    }

    /**
     * Récupérer les badges publics d'un expert (pour affichage sur son profil public)
     */
    @GetMapping("/badges/expert/{utilisateurId}")
    public ResponseEntity<List<BadgeCompetenceDTO>> getBadgesExpert(
            @PathVariable String utilisateurId
    ) {
        List<BadgeCompetenceDTO> badges = badgeService.getMesBadges(utilisateurId, true)
                .stream()
                .filter(BadgeCompetenceDTO::getEstPublic)
                .toList();
        return ResponseEntity.ok(badges);
    }
}
