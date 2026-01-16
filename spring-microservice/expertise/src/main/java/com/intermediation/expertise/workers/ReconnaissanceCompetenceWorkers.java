package com.intermediation.expertise.workers;

import com.intermediation.expertise.dto.BadgeCompetenceDTO;
import com.intermediation.expertise.dto.DemandeReconnaissanceDTO;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.repository.DemandeReconnaissanceRepository;
import com.intermediation.expertise.service.BadgeService;
import io.camunda.zeebe.client.api.response.ActivatedJob;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import io.camunda.zeebe.spring.client.annotation.Variable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Workers Zeebe pour le processus BPMN de reconnaissance de compétence
 */
@Component
public class ReconnaissanceCompetenceWorkers {

    private static final Logger logger = LoggerFactory.getLogger(ReconnaissanceCompetenceWorkers.class);

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private DemandeReconnaissanceRepository demandeRepository;

    /**
     * Worker pour créer le badge de compétence après approbation
     * NOTE: Le badge est déjà créé par TraitementDemandeService.approuverDemandeParManager()
     * Ce worker vérifie simplement si le badge existe et retourne ses infos
     */
    @JobWorker(type = "creer-badge")
    public Map<String, Object> creerBadge(
            final ActivatedJob job,
            @Variable Long demandeId,
            @Variable String expertId) {

        logger.info("🎖️ [WORKER] Vérification/Création du badge pour la demande {}", demandeId);

        Map<String, Object> variables = new HashMap<>();

        try {
            // Récupérer la demande
            var demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée: " + demandeId));

            // Vérifier si un badge a déjà été créé pour cette demande
            // (créé par TraitementDemandeService lors de l'approbation)
            var badgeExistant = badgeService.getBadgeParDemandeId(demandeId);

            if (badgeExistant != null) {
                // Badge déjà créé par le service d'approbation, on retourne ses infos
                logger.info("✅ [WORKER] Badge déjà existant pour la demande {}: badgeId={}, niveau={}",
                        demandeId, badgeExistant.getId(), badgeExistant.getNiveauCertification());

                variables.put("badgeId", badgeExistant.getId());
                variables.put("badgeCree", true);
                variables.put("niveauCertification", badgeExistant.getNiveauCertification().toString());
            } else {
                // Cas exceptionnel : badge non créé, on le crée (validité permanente par défaut)
                logger.warn("⚠️ [WORKER] Badge non trouvé pour la demande {}, création...", demandeId);
                BadgeCompetenceDTO badge = badgeService.attribuerBadge(demande);

                variables.put("badgeId", badge.getId());
                variables.put("badgeCree", true);
                variables.put("niveauCertification", badge.getNiveauCertification().toString());

                logger.info("✅ [WORKER] Badge créé: badgeId={}, niveau={}",
                        badge.getId(), badge.getNiveauCertification());
            }

        } catch (Exception e) {
            logger.error("❌ [WORKER] Erreur lors de la vérification/création du badge pour la demande {}", demandeId, e);
            variables.put("badgeCree", false);
            variables.put("erreur", e.getMessage());
            throw new RuntimeException("Échec de création du badge", e);
        }

        return variables;
    }

    /**
     * Worker pour notifier l'expert de l'approbation de sa demande
     */
    @JobWorker(type = "notifier-approbation")
    public void notifierApprobation(
            final ActivatedJob job,
            @Variable Long demandeId,
            @Variable String expertId,
            @Variable(name = "badgeId") Long badgeId) {

        logger.info("📧 [WORKER] Notification d'approbation pour la demande {} (expert: {})", demandeId, expertId);

        try {
            var demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée: " + demandeId));

            // TODO: Implémenter l'envoi de notification (email, SMS, notification push, etc.)
            // Pour l'instant, on log simplement
            logger.info("✅ [WORKER] Notification envoyée à l'expert {}", expertId);
            logger.info("   - Compétence ID: {}", demande.getCompetenceId());
            logger.info("   - Badge ID: {}", badgeId != null ? badgeId : "N/A");
            logger.info("   - Message: Félicitations! Votre demande de reconnaissance a été approuvée.");

            // Exemple de ce qui pourrait être fait:
            // emailService.envoyerEmail(expertId, "Demande approuvée", messageTemplate);
            // notificationService.envoyerNotification(expertId, "Votre badge est prêt!");

        } catch (Exception e) {
            logger.error("❌ [WORKER] Erreur lors de l'envoi de la notification d'approbation", e);
            // On ne throw pas pour ne pas bloquer le processus
        }
    }

    /**
     * Worker pour notifier l'expert du rejet de sa demande
     */
    @JobWorker(type = "notifier-rejet")
    public void notifierRejet(
            final ActivatedJob job,
            @Variable Long demandeId,
            @Variable String expertId,
            @Variable(name = "motifRejet") String motifRejet) {

        logger.info("📧 [WORKER] Notification de rejet pour la demande {} (expert: {})", demandeId, expertId);

        try {
            var demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée: " + demandeId));

            // TODO: Implémenter l'envoi de notification
            logger.info("✅ [WORKER] Notification de rejet envoyée à l'expert {}", expertId);
            logger.info("   - Compétence ID: {}", demande.getCompetenceId());
            logger.info("   - Motif: {}", (motifRejet == null || motifRejet.isEmpty()) ? "Non spécifié" : motifRejet);
            logger.info("   - Message: Votre demande de reconnaissance a été rejetée.");

            // Exemple:
            // emailService.envoyerEmail(expertId, "Demande rejetée", messageTemplate);

        } catch (Exception e) {
            logger.error("❌ [WORKER] Erreur lors de l'envoi de la notification de rejet", e);
        }
    }

    /**
     * Worker pour notifier l'expert qu'un complément d'information est demandé par le Manager
     */
    @JobWorker(type = "notifier-complement")
    public void notifierComplementRequis(
            final ActivatedJob job,
            @Variable Long demandeId,
            @Variable String expertId,
            @Variable(name = "commentaireManager") String commentaireManager) {

        logger.info("📧 [WORKER] Notification de complément requis pour la demande {} (Expert: {})", demandeId, expertId);

        try {
            var demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée: " + demandeId));

            // TODO: Implémenter l'envoi de notification
            logger.info("✅ [WORKER] Notification de complément envoyée à l'expert {}", expertId);
            logger.info("   - Compétence ID: {}", demande.getCompetenceId());
            logger.info("   - Demande ID: {}", demandeId);
            logger.info("   - Commentaire Manager: {}", (commentaireManager == null || commentaireManager.isEmpty()) ? "Non spécifié" : commentaireManager);
            logger.info("   - Message: Le Manager demande des compléments d'information sur votre demande de reconnaissance.");

            // Exemple:
            // emailService.envoyerEmail(expertId, "Complément d'information requis", messageTemplate);
            // notificationService.envoyerNotification(expertId, "Le Manager demande des informations complémentaires pour la demande " + demandeId);

        } catch (Exception e) {
            logger.error("❌ [WORKER] Erreur lors de l'envoi de la notification de complément", e);
        }
    }

    // Note: Le worker "valider-demande" a été supprimé car nous utilisons maintenant
    // une ReceiveTask qui attend le message "msg_decision_manager" au lieu d'une ServiceTask
}
