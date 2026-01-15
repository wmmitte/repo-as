package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.model.EvaluationCompetence.Recommandation;
import com.intermediation.expertise.repository.*;
import io.camunda.zeebe.client.ZeebeClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour le traitement des demandes de reconnaissance (côté traitant/admin)
 */
@Service
public class TraitementDemandeService {

    private static final Logger logger = LoggerFactory.getLogger(TraitementDemandeService.class);

    @Autowired
    private DemandeReconnaissanceRepository demandeRepository;

    @Autowired
    private PieceJustificativeRepository pieceRepository;

    @Autowired
    private EvaluationCompetenceRepository evaluationRepository;

    @Autowired
    private CompetenceRepository competenceRepository;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UtilisateurRhService utilisateurRhService;

    @Autowired(required = false)
    private ZeebeClient zeebeClient;

    /**
     * Envoyer un message Zeebe pour la décision du Manager
     * Ce message débloquera la ReceiveTask "Attendre décision du Manager"
     */
    private void completerTacheValidationManager(DemandeReconnaissanceCompetence demande,
                                                   String decision,
                                                   String commentaireManager,
                                                   Boolean validitePermanente,
                                                   LocalDateTime dateExpiration) {
        if (demande.getProcessInstanceKey() == null) {
            logger.warn("⚠️ Pas de processus associé - le message ne sera pas envoyé");
            return;
        }

        try {
            // Préparer les variables de décision du Manager
            Map<String, Object> variables = new HashMap<>();
            variables.put("decision", decision);
            variables.put("commentaireManager", commentaireManager != null ? commentaireManager : "");

            if ("APPROUVER".equals(decision)) {
                variables.put("validitePermanente", validitePermanente != null ? validitePermanente : true);
                if (dateExpiration != null) {
                    variables.put("dateExpiration", dateExpiration.toString());
                }
            }

            // Publier un message Zeebe pour débloquer la ReceiveTask
            zeebeClient.newPublishMessageCommand()
                .messageName("msg_decision_manager")
                .correlationKey(String.valueOf(demande.getId()))
                .variables(variables)
                .send()
                .join();

            logger.info("✅ Message 'msg_decision_manager' publié pour la demande {}: decision={}",
                       demande.getId(), decision);
            logger.info("   La ReceiveTask sera débloquée et le processus continuera");

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la publication du message Zeebe", e);
            throw new RuntimeException("Erreur lors de la publication du message: " + e.getMessage());
        }
    }

    /**
     * Récupérer les demandes disponibles pour traitement
     */
    public List<DemandeReconnaissanceDTO> getDemandesATraiter(String traitantId, StatutDemande statut) {
        List<DemandeReconnaissanceCompetence> demandes;
        
        if (statut != null) {
            demandes = demandeRepository.findByStatutOrderByPrioriteDescDateCreationAsc(statut);
        } else {
            // Demandes en attente et non assignées, ou assignées au traitant
            List<StatutDemande> statuts = Arrays.asList(
                StatutDemande.EN_ATTENTE,
                StatutDemande.EN_COURS_TRAITEMENT
            );
            demandes = demandeRepository.findDemandesDisponiblesPourTraitant(statuts, traitantId);
        }

        return demandes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une demande avec tous ses détails pour évaluation
     */
    public DemandeReconnaissanceDTO getDemandeDetails(Long demandeId) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        return convertToDTOWithDetails(demande);
    }

    /**
     * Assigner une demande à un traitant
     */
    @Transactional
    public DemandeReconnaissanceDTO assignerDemande(Long demandeId, String traitantId) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new RuntimeException("Cette demande ne peut pas être assignée");
        }

        demande.assigner(traitantId);
        demande = demandeRepository.save(demande);

        logger.info("Demande {} assignée au traitant {}", demandeId, traitantId);

        return convertToDTO(demande);
    }

    /**
     * Évaluer une demande
     */
    @Transactional
    public EvaluationCompetenceDTO evaluerDemande(Long demandeId, String traitantId, EvaluationRequest request) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que le traitant est bien assigné
        if (!traitantId.equals(demande.getTraitantId())) {
            throw new RuntimeException("Vous n'êtes pas assigné à cette demande");
        }

        // Vérifier que la demande est dans un état permettant l'évaluation
        if (demande.getStatut() != StatutDemande.ASSIGNEE_RH && 
            demande.getStatut() != StatutDemande.EN_COURS_EVALUATION &&
            demande.getStatut() != StatutDemande.EN_COURS_TRAITEMENT) {
            throw new RuntimeException("Cette demande ne peut pas être évaluée dans son état actuel: " + demande.getStatut());
        }
        
        // Si la demande est ASSIGNEE_RH, la passer en EN_COURS_EVALUATION
        if (demande.getStatut() == StatutDemande.ASSIGNEE_RH) {
            demande.demarrerEvaluation();
            demandeRepository.save(demande);
        }

        // Créer ou mettre à jour l'évaluation
        EvaluationCompetence evaluation = evaluationRepository.findByDemandeId(demandeId)
                .orElse(new EvaluationCompetence(demandeId, traitantId, request.getRecommandation()));

        evaluation.setRecommandation(request.getRecommandation());
        evaluation.setCommentaire(request.getCommentaire());
        evaluation.setTempsEvaluationMinutes(request.getTempsEvaluationMinutes());
        evaluation.setCriteres(request.getCriteres());
        evaluation.setNoteGlobale(request.getNoteGlobale());

        evaluation = evaluationRepository.save(evaluation);

        logger.info("Évaluation créée pour la demande {} par le traitant {}", demandeId, traitantId);

        return new EvaluationCompetenceDTO(evaluation);
    }

    /**
     * Approuver une demande (après évaluation)
     */
    @Transactional
    public DemandeReconnaissanceDTO approuverDemande(Long demandeId, String traitantId, String commentaire) {
        return approuverDemande(demandeId, traitantId, commentaire, true, null);
    }

    /**
     * Approuver une demande avec définition de la validité du badge
     * 
     * @param demandeId ID de la demande
     * @param traitantId ID du traitant
     * @param commentaire Commentaire d'approbation
     * @param validitePermanente True pour validité permanente, false pour validité limitée
     * @param dateExpiration Date d'expiration (si validité limitée)
     */
    @Transactional
    public DemandeReconnaissanceDTO approuverDemande(Long demandeId, String traitantId, String commentaire,
                                                      Boolean validitePermanente, LocalDateTime dateExpiration) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que le traitant est bien assigné
        if (!traitantId.equals(demande.getTraitantId())) {
            throw new RuntimeException("Vous n'êtes pas assigné à cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_COURS_TRAITEMENT) {
            throw new RuntimeException("Cette demande ne peut pas être approuvée dans son état actuel");
        }

        // Vérifier qu'une évaluation existe
        EvaluationCompetence evaluation = evaluationRepository.findByDemandeId(demandeId)
                .orElseThrow(() -> new RuntimeException("Une évaluation doit être créée avant l'approbation"));

        if (evaluation.getRecommandation() != Recommandation.APPROUVER) {
            throw new RuntimeException("L'évaluation ne recommande pas l'approbation");
        }

        // Approuver la demande
        demande.approuver(commentaire);
        demande = demandeRepository.save(demande);

        // Créer le badge avec les paramètres de validité
        badgeService.attribuerBadge(demande, validitePermanente, dateExpiration);
        
        logger.info("Badge attribué avec validité: permanente={}, expiration={}", 
                   validitePermanente, dateExpiration);

        logger.info("Demande {} approuvée par le traitant {}", demandeId, traitantId);

        return convertToDTO(demande);
    }

    /**
     * Rejeter une demande
     */
    @Transactional
    public DemandeReconnaissanceDTO rejeterDemande(Long demandeId, String traitantId, String motif) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que le traitant est bien assigné
        if (!traitantId.equals(demande.getTraitantId())) {
            throw new RuntimeException("Vous n'êtes pas assigné à cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_COURS_TRAITEMENT) {
            throw new RuntimeException("Cette demande ne peut pas être rejetée dans son état actuel");
        }

        // Rejeter la demande
        demande.rejeter(motif);
        demande = demandeRepository.save(demande);

        logger.info("Demande {} rejetée par le traitant {}", demandeId, traitantId);

        return convertToDTO(demande);
    }

    /**
     * Demander des compléments d'information
     */
    @Transactional
    public DemandeReconnaissanceDTO demanderComplement(Long demandeId, String traitantId, String commentaire) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que le traitant est bien assigné
        if (!traitantId.equals(demande.getTraitantId())) {
            throw new RuntimeException("Vous n'êtes pas assigné à cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_COURS_TRAITEMENT) {
            throw new RuntimeException("Cette demande ne peut pas être modifiée dans son état actuel");
        }

        // Demander complément
        demande.demanderComplement(commentaire);
        demande = demandeRepository.save(demande);

        logger.info("Complément demandé pour la demande {} par le traitant {}", demandeId, traitantId);

        return convertToDTO(demande);
    }

    /**
     * Marquer une pièce justificative comme vérifiée
     */
    @Transactional
    public PieceJustificativeDTO marquerPieceVerifiee(Long pieceId) {
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce justificative non trouvée"));

        piece.marquerVerifie();
        piece = pieceRepository.save(piece);

        logger.info("Pièce justificative {} marquée comme vérifiée", pieceId);

        return new PieceJustificativeDTO(piece);
    }

    /**
     * Obtenir les statistiques de traitement
     */
    public StatistiquesTraitementDTO getStatistiques(String traitantId) {
        StatistiquesTraitementDTO stats = new StatistiquesTraitementDTO();

        // Compteurs globaux
        stats.setTotalDemandes(demandeRepository.count());
        stats.setDemandesEnAttente(demandeRepository.countByStatut(StatutDemande.EN_ATTENTE));
        stats.setDemandesEnCours(demandeRepository.countByStatut(StatutDemande.EN_COURS_TRAITEMENT));
        stats.setDemandesApprouvees(demandeRepository.countByStatut(StatutDemande.APPROUVEE));
        stats.setDemandesRejetees(demandeRepository.countByStatut(StatutDemande.REJETEE));
        stats.setDemandesComplementRequis(demandeRepository.countByStatut(StatutDemande.COMPLEMENT_REQUIS));

        // Statistiques par statut
        Map<String, Long> parStatut = new HashMap<>();
        demandeRepository.countByStatutGrouped().forEach(row -> {
            StatutDemande statut = (StatutDemande) row[0];
            Long count = (Long) row[1];
            parStatut.put(statut.name(), count);
        });
        stats.setDemandesParStatut(parStatut);

        // Statistiques pour le traitant
        if (traitantId != null) {
            stats.setMesDemandesEnCours(demandeRepository.countByTraitantIdAndStatut(
                traitantId, StatutDemande.EN_COURS_TRAITEMENT));
            
            long approuvees = demandeRepository.countByTraitantIdAndStatut(
                traitantId, StatutDemande.APPROUVEE);
            long rejetees = demandeRepository.countByTraitantIdAndStatut(
                traitantId, StatutDemande.REJETEE);
            stats.setMesDemandesTraitees(approuvees + rejetees);

            // Taux d'approbation
            if (stats.getMesDemandesTraitees() > 0) {
                stats.setTauxApprobation((double) approuvees / stats.getMesDemandesTraitees() * 100);
            }

            // Note moyenne
            stats.setNoteMoyenne(evaluationRepository.getMoyenneNotesByTraitant(traitantId));
        }

        return stats;
    }

    /**
     * Récupérer les demandes assignées à un traitant RH
     * Filtre pour ne montrer que les demandes nécessitant une action du RH
     */
    public List<DemandeReconnaissanceDTO> getMesDemandes(String traitantId) {
        logger.info("🔍 getMesDemandes appelé pour le RH: {}", traitantId);

        // Statuts pertinents pour le RH : demandes assignées et en cours d'évaluation
        List<StatutDemande> statutsRh = Arrays.asList(
            StatutDemande.ASSIGNEE_RH,
            StatutDemande.EN_COURS_EVALUATION
        );

        logger.info("🔍 Recherche des demandes avec statuts: {}", statutsRh);

        List<DemandeReconnaissanceCompetence> demandes = demandeRepository
                .findByTraitantIdAndStatutIn(traitantId, statutsRh)
                .stream()
                .sorted((d1, d2) -> d2.getDateDerniereModification().compareTo(d1.getDateDerniereModification()))
                .collect(Collectors.toList());

        logger.info("✅ Récupération de {} demandes pour le RH {}", demandes.size(), traitantId);

        // Log détaillé de chaque demande
        demandes.forEach(d -> logger.info("  - Demande ID={}, traitantId={}, statut={}, competenceId={}",
            d.getId(), d.getTraitantId(), d.getStatut(), d.getCompetenceId()));

        return demandes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Méthodes de conversion
    private DemandeReconnaissanceDTO convertToDTO(DemandeReconnaissanceCompetence demande) {
        DemandeReconnaissanceDTO dto = new DemandeReconnaissanceDTO(demande);

        // Enrichir avec le nom de la compétence et le competenceReferenceId
        competenceRepository.findById(demande.getCompetenceId())
                .ifPresent(c -> {
                    dto.setCompetenceNom(c.getNom());
                    dto.setCompetenceReferenceId(c.getCompetenceReferenceId());
                });

        // Compter les pièces
        dto.setNombrePieces((int) pieceRepository.countByDemandeId(demande.getId()));

        // Récupérer le nom complet du RH assigné si disponible
        if (demande.getTraitantId() != null) {
            try {
                UtilisateurRhDTO rh = utilisateurRhService.getUtilisateurRhParId(demande.getTraitantId());
                if (rh != null && rh.getNom() != null) {
                    dto.setTraitantNom(rh.getNom());
                }
            } catch (Exception e) {
                logger.warn("Impossible de récupérer le nom du RH {}: {}", demande.getTraitantId(), e.getMessage());
            }
        }

        return dto;
    }

    private DemandeReconnaissanceDTO convertToDTOWithDetails(DemandeReconnaissanceCompetence demande) {
        DemandeReconnaissanceDTO dto = convertToDTO(demande);

        // Ajouter les pièces justificatives
        List<PieceJustificative> pieces = pieceRepository.findByDemandeIdOrderByDateAjoutAsc(demande.getId());
        dto.setPieces(pieces.stream().map(PieceJustificativeDTO::new).collect(Collectors.toList()));

        // Ajouter l'évaluation si elle existe
        evaluationRepository.findByDemandeId(demande.getId())
                .ifPresent(eval -> dto.setEvaluation(new EvaluationCompetenceDTO(eval)));

        return dto;
    }

    // ========== NOUVELLES MÉTHODES POUR LE WORKFLOW MANAGER/RH ==========

    /**
     * Assigner une demande à un RH spécifique (par un Manager)
     * Permet l'assignation initiale et la réassignation
     */
    @Transactional
    public DemandeReconnaissanceDTO assignerDemandeAuRh(Long demandeId, String managerId, String rhId, String commentaire) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que la demande peut être (ré)assignée
        // Statuts autorisés : EN_ATTENTE, ASSIGNEE_RH, EN_COURS_EVALUATION, EN_ATTENTE_VALIDATION
        List<StatutDemande> statutsAutorises = Arrays.asList(
            StatutDemande.EN_ATTENTE,
            StatutDemande.ASSIGNEE_RH,
            StatutDemande.EN_COURS_EVALUATION,
            StatutDemande.EN_ATTENTE_VALIDATION,
            StatutDemande.COMPLEMENT_REQUIS
        );

        if (!statutsAutorises.contains(demande.getStatut())) {
            throw new RuntimeException("Cette demande ne peut pas être (ré)assignée car elle est déjà " + demande.getStatut());
        }

        // Si c'est une réassignation (demande déjà assignée), logger l'information
        if (demande.getTraitantId() != null && !demande.getTraitantId().equals(rhId)) {
            logger.info("🔄 Réassignation de la demande {} : ancien RH = {}, nouveau RH = {}",
                demandeId, demande.getTraitantId(), rhId);
        }

        // Utiliser la nouvelle méthode d'assignation avec le commentaire du manager (instructions au RH)
        demande.assignerAuRh(managerId, rhId, commentaire);
        logger.info("📝 Après assignerAuRh: demandeId={}, traitantId={}, managerId={}, statut={}, commentaireAssignation={}",
            demande.getId(), demande.getTraitantId(), demande.getManagerId(), demande.getStatut(),
            commentaire != null ? "présent" : "absent");

        demande = demandeRepository.save(demande);
        logger.info("💾 Après save: demandeId={}, traitantId={}, managerId={}, statut={}",
            demande.getId(), demande.getTraitantId(), demande.getManagerId(), demande.getStatut());

        logger.info("✅ Demande {} assignée au RH {} par le manager {}", demandeId, rhId, managerId);

        // Publier le message Camunda pour faire avancer le processus
        publierMessageRhAssigne(demandeId, managerId, rhId);

        return convertToDTO(demande);
    }

    /**
     * Publier un message Camunda pour indiquer qu'un RH a été assigné
     * Cela fait avancer le processus BPMN de la tâche "Attendre assignation" vers "Évaluer la demande"
     */
    private void publierMessageRhAssigne(Long demandeId, String managerId, String rhId) {
        if (zeebeClient == null) {
            logger.warn("⚠️ ZeebeClient non disponible - le processus BPMN ne sera pas mis à jour");
            return;
        }

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("rhId", rhId);
            variables.put("managerId", managerId);

            zeebeClient.newPublishMessageCommand()
                .messageName("msg_rh_assigne")
                .correlationKey(String.valueOf(demandeId))
                .variables(variables)
                .send()
                .join();

            logger.info("✅ Message Camunda 'msg_rh_assigne' publié pour la demande {}", demandeId);

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la publication du message Camunda", e);
            // Ne pas faire échouer l'assignation si Camunda échoue
        }
    }

    /**
     * Le RH soumet son évaluation au Manager
     */
    @Transactional
    public DemandeReconnaissanceDTO soumettreEvaluationAuManager(Long demandeId, String rhId) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que le RH est bien assigné
        if (!rhId.equals(demande.getTraitantId())) {
            throw new RuntimeException("Vous n'êtes pas assigné à cette demande");
        }

        // Vérifier qu'une évaluation existe
        EvaluationCompetence evaluation = evaluationRepository.findByDemandeId(demandeId)
                .orElseThrow(() -> new RuntimeException("Une évaluation doit être créée avant la soumission"));

        // Soumettre au Manager
        demande.soumettreAuManager();
        demande = demandeRepository.save(demande);

        logger.info("✅ Évaluation de la demande {} soumise au Manager par le RH {}", demandeId, rhId);

        // Publier le message Zeebe pour faire avancer le processus vers la UserTask "valider-demande"
        completerUserTasksEvaluation(demandeId, evaluation);

        return convertToDTO(demande);
    }

    /**
     * Compléter les userTasks Zeebe "evaluer-demande" et "soumettre-evaluation"
     */
    private void completerUserTasksEvaluation(Long demandeId, EvaluationCompetence evaluation) {
        if (zeebeClient == null) {
            logger.warn("⚠️ ZeebeClient non disponible - les userTasks Zeebe ne seront pas complétées");
            return;
        }

        try {
            // Préparer les variables pour Zeebe
            Map<String, Object> variables = new HashMap<>();
            variables.put("noteGlobale", evaluation.getNoteGlobale());
            variables.put("recommandation", evaluation.getRecommandation() != null ?
                evaluation.getRecommandation().toString() : "");
            variables.put("commentaireEvaluation", evaluation.getCommentaire() != null ?
                evaluation.getCommentaire() : "");

            // Compléter les userTasks en attente pour cette demande
            // Zeebe va automatiquement passer de "evaluer-demande" à "soumettre-evaluation" puis à "valider-demande"
            logger.info("📨 Publication des variables d'évaluation pour la demande {}", demandeId);

            // Publier un message pour faire avancer le processus
            zeebeClient.newPublishMessageCommand()
                .messageName("msg_evaluation_soumise")
                .correlationKey(String.valueOf(demandeId))
                .variables(variables)
                .send()
                .join();

            logger.info("✅ Message 'msg_evaluation_soumise' publié pour la demande {}", demandeId);

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la complétion des userTasks Zeebe", e);
        }
    }

    /**
     * Récupérer les demandes en attente de validation par le Manager
     */
    public List<DemandeReconnaissanceDTO> getDemandesEnAttenteValidation(String managerId) {
        logger.info("🔍 [getDemandesEnAttenteValidation] Manager ID reçu: {}", managerId);

        // Récupérer toutes les demandes EN_ATTENTE_VALIDATION pour debug
        List<DemandeReconnaissanceCompetence> toutesDemandesEnAttente = demandeRepository.findAll().stream()
                .filter(d -> d.getStatut() == StatutDemande.EN_ATTENTE_VALIDATION)
                .collect(Collectors.toList());

        logger.info("🔍 Nombre total de demandes EN_ATTENTE_VALIDATION: {}", toutesDemandesEnAttente.size());
        toutesDemandesEnAttente.forEach(d ->
            logger.info("  - Demande ID={}, managerId={}, equals={}",
                d.getId(), d.getManagerId(), managerId.equals(d.getManagerId()))
        );

        // Récupérer les demandes en attente de validation assignées par ce manager
        List<DemandeReconnaissanceCompetence> demandes = toutesDemandesEnAttente.stream()
                .filter(d -> managerId.equals(d.getManagerId()))
                .sorted((d1, d2) -> d2.getDateEvaluation().compareTo(d1.getDateEvaluation()))
                .collect(Collectors.toList());

        logger.info("✅ Nombre de demandes pour le manager {}: {}", managerId, demandes.size());

        return demandes.stream()
                .map(this::convertToDTOWithDetails)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les demandes assignées aux RH (pour le Manager)
     */
    public List<DemandeReconnaissanceDTO> getDemandesAssignees(String managerId) {
        List<StatutDemande> statutsAssignes = Arrays.asList(
            StatutDemande.ASSIGNEE_RH,
            StatutDemande.EN_COURS_EVALUATION
        );

        List<DemandeReconnaissanceCompetence> demandes = demandeRepository.findAll().stream()
                .filter(d -> statutsAssignes.contains(d.getStatut()))
                .filter(d -> managerId.equals(d.getManagerId()))
                .sorted((d1, d2) -> d2.getDateAssignation().compareTo(d1.getDateAssignation()))
                .collect(Collectors.toList());

        return demandes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Modifier la méthode approuverDemande pour vérifier que c'est le bon Manager
     */
    @Transactional
    public DemandeReconnaissanceDTO approuverDemandeParManager(Long demandeId, String managerId, String commentaire,
                                                                Boolean validitePermanente, LocalDateTime dateExpiration) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que c'est le bon manager
        if (!managerId.equals(demande.getManagerId())) {
            throw new RuntimeException("Vous n'êtes pas le manager qui a assigné cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Cette demande ne peut pas être approuvée dans son état actuel");
        }

        // Vérifier qu'une évaluation existe
        EvaluationCompetence evaluation = evaluationRepository.findByDemandeId(demandeId)
                .orElseThrow(() -> new RuntimeException("Une évaluation doit exister avant l'approbation"));

        // Approuver la demande
        demande.approuver(commentaire);
        demande = demandeRepository.save(demande);

        // Compléter la tâche Zeebe pour faire avancer le processus BPMN
        completerTacheValidationManager(demande, "APPROUVER", commentaire, validitePermanente, dateExpiration);

        // Créer le badge avec les paramètres de validité
        badgeService.attribuerBadge(demande, validitePermanente, dateExpiration);

        logger.info("Demande {} approuvée par le manager {}", demandeId, managerId);

        return convertToDTO(demande);
    }

    /**
     * Modifier la méthode rejeterDemande pour vérifier que c'est le bon Manager
     */
    @Transactional
    public DemandeReconnaissanceDTO rejeterDemandeParManager(Long demandeId, String managerId, String motif) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que c'est le bon manager
        if (!managerId.equals(demande.getManagerId())) {
            throw new RuntimeException("Vous n'êtes pas le manager qui a assigné cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Cette demande ne peut pas être rejetée dans son état actuel");
        }

        // Rejeter la demande
        demande.rejeter(motif);
        demande = demandeRepository.save(demande);

        // Compléter la tâche Zeebe pour faire avancer le processus BPMN
        completerTacheValidationManager(demande, "REJETER", motif, null, null);

        logger.info("Demande {} rejetée par le manager {}", demandeId, managerId);

        return convertToDTO(demande);
    }

    /**
     * Demander un complément d'information à l'expert (Manager)
     */
    @Transactional
    public DemandeReconnaissanceDTO demanderComplementParManager(Long demandeId, String managerId, String commentaire) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier que c'est le bon manager
        if (!managerId.equals(demande.getManagerId())) {
            throw new RuntimeException("Vous n'êtes pas le manager qui a assigné cette demande");
        }

        if (demande.getStatut() != StatutDemande.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Cette demande ne peut pas être modifiée dans son état actuel");
        }

        // Demander complément
        demande.demanderComplement(commentaire);
        demande = demandeRepository.save(demande);

        // Compléter la tâche Zeebe pour faire avancer le processus BPMN
        completerTacheValidationManager(demande, "COMPLEMENT_REQUIS", commentaire, null, null);

        // Notifier l'expert qu'un complément est demandé
        notifierExpertComplementRequis(demande, commentaire);

        logger.info("Complément demandé pour la demande {} par le manager {}", demandeId, managerId);

        return convertToDTO(demande);
    }

    /**
     * Notifier l'expert qu'un complément d'information est requis
     */
    private void notifierExpertComplementRequis(DemandeReconnaissanceCompetence demande, String commentaireManager) {
        try {
            // TODO: Implémenter l'envoi de notification réelle (email, SMS, notification push, etc.)
            logger.info("📧 Notification de complément requis envoyée à l'expert {}", demande.getUtilisateurId());
            logger.info("   - Demande ID: {}", demande.getId());
            logger.info("   - Compétence ID: {}", demande.getCompetenceId());
            logger.info("   - Commentaire Manager: {}", commentaireManager != null && !commentaireManager.isEmpty() ? commentaireManager : "Non spécifié");
            logger.info("   - Message: Le Manager demande des compléments d'information sur votre demande de reconnaissance.");

            // Exemple de ce qui pourrait être implémenté:
            // emailService.envoyerEmail(demande.getUtilisateurId(), "Complément d'information requis", messageTemplate);
            // notificationService.envoyerNotification(demande.getUtilisateurId(), "Le Manager demande des informations complémentaires");
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'envoi de la notification de complément à l'expert", e);
            // On ne throw pas pour ne pas bloquer le processus
        }
    }
}
