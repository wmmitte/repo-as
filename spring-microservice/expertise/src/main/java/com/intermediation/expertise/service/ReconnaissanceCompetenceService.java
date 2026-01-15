package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import io.camunda.zeebe.client.ZeebeClient;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.intermediation.expertise.model.BadgeCompetence;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des demandes de reconnaissance de compétence (côté expert)
 */
@Service
public class ReconnaissanceCompetenceService {

    private static final Logger logger = LoggerFactory.getLogger(ReconnaissanceCompetenceService.class);

    @Autowired
    private DemandeReconnaissanceRepository demandeRepository;

    @Autowired
    private PieceJustificativeRepository pieceRepository;

    @Autowired
    private CompetenceRepository competenceRepository;

    @Autowired
    private CompetenceReferenceRepository competenceReferenceRepository;

    @Autowired
    private BadgeCompetenceRepository badgeRepository;

    @Autowired
    private EvaluationCompetenceRepository evaluationRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired(required = false)
    private ZeebeClient zeebeClient;

    /**
     * Soumettre une nouvelle demande de reconnaissance
     */
    @Transactional
    public DemandeReconnaissanceDTO soumettreDemande(String utilisateurId, CreateDemandeReconnaissanceRequest request) {
        logger.info("Soumission d'une demande de reconnaissance pour l'utilisateur {} et la compétence {}", 
                    utilisateurId, request.getCompetenceId());

        // Vérifier que la compétence existe et appartient à l'utilisateur
        Competence competence = competenceRepository.findById(request.getCompetenceId())
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        if (!competence.getUtilisateurId().equals(utilisateurId)) {
            throw new RuntimeException("Cette compétence ne vous appartient pas");
        }

        // Vérifier qu'il n'y a pas déjà une demande en cours pour cette compétence
        boolean existeDemande = demandeRepository
                .findByUtilisateurIdAndCompetenceIdAndStatut(utilisateurId, request.getCompetenceId(), StatutDemande.EN_ATTENTE)
                .isPresent() ||
                demandeRepository
                .findByUtilisateurIdAndCompetenceIdAndStatut(utilisateurId, request.getCompetenceId(), StatutDemande.EN_COURS_TRAITEMENT)
                .isPresent() ||
                demandeRepository
                .findByUtilisateurIdAndCompetenceIdAndStatut(utilisateurId, request.getCompetenceId(), StatutDemande.COMPLEMENT_REQUIS)
                .isPresent();

        if (existeDemande) {
            throw new RuntimeException("Une demande de certification est déjà en cours pour cette compétence");
        }

        // Créer la demande
        DemandeReconnaissanceCompetence demande = new DemandeReconnaissanceCompetence(utilisateurId, request.getCompetenceId());
        demande.setCommentaireExpert(request.getCommentaire());

        demande = demandeRepository.save(demande);

        // Incrémenter le nombre de demandes de la compétence
        competence.setNombreDemandes(competence.getNombreDemandes() + 1);
        competenceRepository.save(competence);

        logger.info("Demande de reconnaissance créée avec l'ID {}", demande.getId());

        // Démarrer le processus BPMN de reconnaissance de compétence
        demarrerProcessusReconnaissance(demande);

        return convertToDTO(demande);
    }

    /**
     * Démarrer le processus BPMN de reconnaissance de compétence
     */
    private void demarrerProcessusReconnaissance(DemandeReconnaissanceCompetence demande) {
        if (zeebeClient == null) {
            logger.warn("⚠️ ZeebeClient non disponible - le processus BPMN ne sera pas démarré");
            return;
        }

        try {
            // Préparer les variables du processus
            Map<String, Object> variables = new HashMap<>();
            variables.put("demandeId", demande.getId());
            variables.put("expertId", demande.getUtilisateurId());
            variables.put("competenceId", demande.getCompetenceId());

            // Démarrer une nouvelle instance du processus
            var processInstance = zeebeClient
                    .newCreateInstanceCommand()
                    .bpmnProcessId("Process_Reconnaissance_Competence")
                    .latestVersion()
                    .variables(variables)
                    .send()
                    .join();

            // Stocker la clé de l'instance du processus dans la demande
            demande.setProcessInstanceKey(processInstance.getProcessInstanceKey());
            demandeRepository.save(demande);

            logger.info("✅ Processus BPMN démarré pour la demande {} - ProcessInstanceKey: {}",
                       demande.getId(), processInstance.getProcessInstanceKey());

        } catch (Exception e) {
            logger.error("❌ Erreur lors du démarrage du processus BPMN pour la demande {}", demande.getId(), e);
            // On ne throw pas pour ne pas bloquer la création de la demande
        }
    }

    /**
     * Ajouter une pièce justificative à une demande
     */
    @Transactional
    public PieceJustificativeDTO ajouterPieceJustificative(String utilisateurId, Long demandeId, 
                                                             MultipartFile file, PieceJustificative.TypePiece typePiece,
                                                             String description) throws IOException {
        logger.info("Ajout d'une pièce justificative à la demande {}", demandeId);

        // Vérifier que la demande existe et appartient à l'utilisateur
        DemandeReconnaissanceCompetence demande = demandeRepository.findByIdAndUtilisateurId(demandeId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée ou accès refusé"));

        // Vérifier que la demande est modifiable
        if (demande.getStatut() != StatutDemande.EN_ATTENTE && 
            demande.getStatut() != StatutDemande.COMPLEMENT_REQUIS) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        // Sauvegarder le fichier
        String filePath = fileStorageService.storeFile(file, utilisateurId, demandeId);

        // Créer la pièce justificative
        PieceJustificative piece = new PieceJustificative(demandeId, typePiece, file.getOriginalFilename(), filePath);
        piece.setNomOriginal(file.getOriginalFilename());
        piece.setTailleOctets(file.getSize());
        piece.setTypeMime(file.getContentType());
        piece.setDescription(description);

        piece = pieceRepository.save(piece);

        logger.info("Pièce justificative ajoutée avec l'ID {}", piece.getId());

        return new PieceJustificativeDTO(piece);
    }

    /**
     * Récupérer les demandes d'un utilisateur
     */
    public List<DemandeReconnaissanceDTO> getMesDemandes(String utilisateurId) {
        List<DemandeReconnaissanceCompetence> demandes = demandeRepository
                .findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);

        return demandes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une demande spécifique avec tous les détails
     */
    public DemandeReconnaissanceDTO getDemandeDetails(String utilisateurId, Long demandeId) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findByIdAndUtilisateurId(demandeId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée ou accès refusé"));

        return convertToDTOWithDetails(demande);
    }

    /**
     * Annuler une demande (uniquement si en attente ou complément requis)
     */
    @Transactional
    public void annulerDemande(String utilisateurId, Long demandeId) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findByIdAndUtilisateurId(demandeId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée ou accès refusé"));

        if (demande.getStatut() != StatutDemande.EN_ATTENTE && 
            demande.getStatut() != StatutDemande.COMPLEMENT_REQUIS) {
            throw new RuntimeException("Cette demande ne peut plus être annulée");
        }

        demande.annuler();
        demandeRepository.save(demande);

        logger.info("Demande {} annulée par l'utilisateur {}", demandeId, utilisateurId);
    }

    /**
     * Resoumettre une demande après avoir fourni les compléments
     */
    @Transactional
    public DemandeReconnaissanceDTO resoumettreApresComplement(String utilisateurId, Long demandeId, String nouveauCommentaire) {
        DemandeReconnaissanceCompetence demande = demandeRepository.findByIdAndUtilisateurId(demandeId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée ou accès refusé"));

        if (demande.getStatut() != StatutDemande.COMPLEMENT_REQUIS) {
            throw new RuntimeException("Cette demande n'est pas en attente de complément");
        }

        demande.resoumettreApresComplement();
        if (nouveauCommentaire != null && !nouveauCommentaire.isEmpty()) {
            demande.setCommentaireExpert(demande.getCommentaireExpert() + "\n\n[Complément] " + nouveauCommentaire);
        }

        demande = demandeRepository.save(demande);

        logger.info("Demande {} resoumise après complément", demandeId);

        // Publier un message Zeebe pour débloquer la ReceiveTask "Attendre complément de l'expert"
        if (demande.getProcessInstanceKey() != null && zeebeClient != null) {
            try {
                Map<String, Object> variables = new HashMap<>();
                variables.put("complementFourni", true);
                variables.put("nouveauCommentaire", nouveauCommentaire != null ? nouveauCommentaire : "");

                zeebeClient.newPublishMessageCommand()
                    .messageName("msg_complement_fourni")
                    .correlationKey(String.valueOf(demande.getId()))
                    .variables(variables)
                    .send()
                    .join();

                logger.info("✅ Message 'msg_complement_fourni' publié pour la demande {}", demandeId);
            } catch (Exception e) {
                logger.error("❌ Erreur lors de la publication du message Zeebe", e);
                // Ne pas bloquer la resoumission même si le message échoue
            }
        }

        return convertToDTO(demande);
    }

    /**
     * Supprimer une pièce justificative
     */
    @Transactional
    public void supprimerPiece(String utilisateurId, Long demandeId, Long pieceId) throws IOException {
        // Vérifier la demande
        DemandeReconnaissanceCompetence demande = demandeRepository.findByIdAndUtilisateurId(demandeId, utilisateurId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée ou accès refusé"));

        if (demande.getStatut() != StatutDemande.EN_ATTENTE && 
            demande.getStatut() != StatutDemande.COMPLEMENT_REQUIS) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        // Récupérer et supprimer la pièce
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce justificative non trouvée"));

        if (!piece.getDemandeId().equals(demandeId)) {
            throw new RuntimeException("Cette pièce n'appartient pas à cette demande");
        }

        // Supprimer le fichier physique
        fileStorageService.deleteFile(piece.getUrlFichier());

        // Supprimer l'entrée en base
        pieceRepository.delete(piece);

        logger.info("Pièce justificative {} supprimée", pieceId);
    }

    // Méthodes de conversion
    private DemandeReconnaissanceDTO convertToDTO(DemandeReconnaissanceCompetence demande) {
        DemandeReconnaissanceDTO dto = new DemandeReconnaissanceDTO(demande);

        // Enrichir avec le nom de la compétence et déterminer le niveau
        competenceRepository.findById(demande.getCompetenceId())
                .ifPresent(c -> {
                    dto.setCompetenceNom(c.getNom());
                    // Déterminer le niveau basé sur le domaine de compétence
                    if (c.getCompetenceReferenceId() != null) {
                        competenceReferenceRepository.findById(c.getCompetenceReferenceId())
                                .ifPresent(ref -> {
                                    if (ref.getDomaineCompetence() != null) {
                                        dto.setNiveauDetermine(ref.getDomaineCompetence().getCode());
                                    }
                                });
                    }
                });

        // Compter les pièces
        dto.setNombrePieces((int) pieceRepository.countByDemandeId(demande.getId()));

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
        
        // Ajouter le badge si la demande est approuvée
        if (demande.getStatut() == StatutDemande.APPROUVEE) {
            badgeRepository.findByDemandeReconnaissanceId(demande.getId())
                    .ifPresent(badge -> dto.setBadge(new BadgeCompetenceDTO(badge)));
        }
        
        return dto;
    }
}
