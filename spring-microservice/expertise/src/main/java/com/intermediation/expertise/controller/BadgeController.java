package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.BadgeCompetenceDTO;
import com.intermediation.expertise.service.BadgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des badges de compétence
 */
@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private static final Logger logger = LoggerFactory.getLogger(BadgeController.class);

    @Autowired
    private BadgeService badgeService;

    /**
     * Récupérer mes badges (utilisateur connecté)
     *
     * @param jwt Token JWT de l'utilisateur connecté
     * @param actifSeulement true pour récupérer uniquement les badges actifs
     * @return Liste des badges de l'utilisateur
     */
    @GetMapping("/mes-badges")
    public ResponseEntity<List<BadgeCompetenceDTO>> getMesBadges(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(value = "actifSeulement", defaultValue = "true") Boolean actifSeulement) {

        String utilisateurId = jwt.getSubject();
        logger.info("GET /api/badges/mes-badges - utilisateurId={}, actifSeulement={}",
                   utilisateurId, actifSeulement);

        try {
            List<BadgeCompetenceDTO> badges = badgeService.getMesBadges(utilisateurId, actifSeulement);
            logger.info("Nombre de badges trouvés: {}", badges.size());
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des badges", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupérer les badges publics d'un utilisateur (pour affichage public sur profil)
     *
     * @param utilisateurId ID de l'utilisateur dont on veut voir les badges
     * @return Liste des badges publics et actifs
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<BadgeCompetenceDTO>> getBadgesPublics(
            @PathVariable String utilisateurId) {

        logger.info("GET /api/badges/utilisateur/{} - récupération des badges publics", utilisateurId);

        try {
            List<BadgeCompetenceDTO> badges = badgeService.getBadgesPublics(utilisateurId);
            logger.info("Nombre de badges publics trouvés: {}", badges.size());
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des badges publics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupérer un badge spécifique par son ID
     *
     * @param badgeId ID du badge
     * @return Le badge demandé
     */
    @GetMapping("/{badgeId}")
    public ResponseEntity<?> getBadge(@PathVariable Long badgeId) {
        logger.info("GET /api/badges/{}", badgeId);

        try {
            BadgeCompetenceDTO badge = badgeService.getBadge(badgeId);
            return ResponseEntity.ok(badge);
        } catch (RuntimeException e) {
            logger.error("Badge non trouvé: {}", badgeId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du badge {}", badgeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Basculer la visibilité publique d'un badge
     *
     * @param jwt Token JWT de l'utilisateur connecté
     * @param badgeId ID du badge
     * @return Le badge avec sa nouvelle visibilité
     */
    @PutMapping("/{badgeId}/toggle-visibilite")
    public ResponseEntity<?> toggleVisibilite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long badgeId) {

        String utilisateurId = jwt.getSubject();
        logger.info("PUT /api/badges/{}/toggle-visibilite - utilisateurId={}", badgeId, utilisateurId);

        try {
            BadgeCompetenceDTO badge = badgeService.toggleVisibilitePublique(utilisateurId, badgeId);
            logger.info("Visibilité du badge {} modifiée. Nouveau statut public: {}",
                       badgeId, badge.getEstPublic());
            return ResponseEntity.ok(badge);
        } catch (RuntimeException e) {
            logger.error("Erreur lors du changement de visibilité: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erreur lors du changement de visibilité du badge {}", badgeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupérer les statistiques de badges de l'utilisateur connecté
     *
     * @param jwt Token JWT de l'utilisateur connecté
     * @return Map avec le nombre de badges par niveau
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques(@AuthenticationPrincipal Jwt jwt) {
        String utilisateurId = jwt.getSubject();
        logger.info("GET /api/badges/statistiques - utilisateurId={}", utilisateurId);

        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", badgeService.countBadgesActifs(utilisateurId));
            stats.put("bronze", badgeService.countBadgesParNiveau(
                utilisateurId,
                com.intermediation.expertise.model.BadgeCompetence.NiveauCertification.BRONZE
            ));
            stats.put("argent", badgeService.countBadgesParNiveau(
                utilisateurId,
                com.intermediation.expertise.model.BadgeCompetence.NiveauCertification.ARGENT
            ));
            stats.put("or", badgeService.countBadgesParNiveau(
                utilisateurId,
                com.intermediation.expertise.model.BadgeCompetence.NiveauCertification.OR
            ));
            stats.put("platine", badgeService.countBadgesParNiveau(
                utilisateurId,
                com.intermediation.expertise.model.BadgeCompetence.NiveauCertification.PLATINE
            ));

            logger.info("Statistiques de badges pour {}: {}", utilisateurId, stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Définir l'ordre d'affichage des badges
     *
     * @param jwt Token JWT de l'utilisateur connecté
     * @param badgeIds Liste ordonnée des IDs de badges
     * @return Confirmation
     */
    @PutMapping("/ordre-affichage")
    public ResponseEntity<?> definirOrdreAffichage(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody List<Long> badgeIds) {

        String utilisateurId = jwt.getSubject();
        logger.info("PUT /api/badges/ordre-affichage - utilisateurId={}, nombre de badges={}",
                   utilisateurId, badgeIds.size());

        try {
            badgeService.definirOrdreAffichage(utilisateurId, badgeIds);
            return ResponseEntity.ok(Map.of("message", "Ordre d'affichage mis à jour"));
        } catch (Exception e) {
            logger.error("Erreur lors de la définition de l'ordre d'affichage", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
