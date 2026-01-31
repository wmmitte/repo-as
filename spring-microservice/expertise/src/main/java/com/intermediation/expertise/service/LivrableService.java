package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des livrables.
 */
@Service
@Transactional
public class LivrableService {

    private static final Logger log = LoggerFactory.getLogger(LivrableService.class);

    private final LivrableTacheRepository livrableRepository;
    private final TacheProjetRepository tacheRepository;
    private final CritereAcceptationLivrableRepository critereRepository;

    public LivrableService(LivrableTacheRepository livrableRepository,
                           TacheProjetRepository tacheRepository,
                           CritereAcceptationLivrableRepository critereRepository) {
        this.livrableRepository = livrableRepository;
        this.tacheRepository = tacheRepository;
        this.critereRepository = critereRepository;
    }

    /**
     * Soumettre un livrable.
     */
    public LivrableTacheDTO soumettreLivrable(Long livrableId, String expertId,
                                               SoumettreLivrableRequest request) {
        log.info("Soumission du livrable {} par l'expert {}", livrableId, expertId);

        LivrableTache livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));

        // Vérifier que l'expert est assigné à la tâche
        UUID expertUUID = UUID.fromString(expertId);
        if (!expertUUID.equals(livrable.getTache().getExpertAssigneId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à soumettre ce livrable");
        }

        // Vérifier que le livrable n'est pas déjà accepté
        if (livrable.getStatut() == LivrableTache.StatutLivrable.ACCEPTE) {
            throw new IllegalStateException("Ce livrable a déjà été accepté");
        }

        livrable.soumettre(
                request.getFichierUrl(),
                request.getFichierNom(),
                request.getFichierTaille(),
                request.getFichierType(),
                request.getCommentaire()
        );

        livrable.setDateModification(LocalDateTime.now());
        livrable = livrableRepository.save(livrable);

        log.info("Livrable {} soumis avec succès", livrableId);
        return new LivrableTacheDTO(livrable);
    }

    /**
     * Valider un livrable (accepter ou refuser).
     */
    public LivrableTacheDTO validerLivrable(Long livrableId, String proprietaireId,
                                             ValiderLivrableRequest request) {
        log.info("Validation du livrable {} par le propriétaire {}", livrableId, proprietaireId);

        LivrableTache livrable = livrableRepository.findByIdAvecCriteres(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));

        // Vérifier que l'utilisateur est le propriétaire du projet
        UUID proprietaireUUID = UUID.fromString(proprietaireId);
        if (!livrable.getTache().getProjet().getProprietaireId().equals(proprietaireUUID)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider ce livrable");
        }

        // Vérifier que le livrable est soumis ou en revue
        if (livrable.getStatut() != LivrableTache.StatutLivrable.SOUMIS &&
                livrable.getStatut() != LivrableTache.StatutLivrable.EN_REVUE) {
            throw new IllegalStateException("Ce livrable ne peut pas être validé dans son état actuel");
        }

        // Valider les critères si fournis
        if (request.getCriteresValidation() != null) {
            for (ValiderLivrableRequest.CritereValidation critereVal : request.getCriteresValidation()) {
                livrable.getCriteres().stream()
                        .filter(c -> c.getId().equals(critereVal.getCritereId()))
                        .findFirst()
                        .ifPresent(critere -> {
                            if (critereVal.getEstSatisfait()) {
                                critere.valider(null);
                            } else {
                                critere.invalider(null);
                            }
                        });
            }
        }

        // Valider ou refuser le livrable
        livrable.valider(proprietaireUUID, request.getAccepte(), request.getCommentaire());
        livrable.setDateModification(LocalDateTime.now());
        livrable = livrableRepository.save(livrable);

        // Si le livrable est accepté, mettre à jour la progression de la tâche
        if (request.getAccepte()) {
            mettreAJourProgressionTache(livrable.getTache());
        }

        log.info("Livrable {} {} par le propriétaire", livrableId, request.getAccepte() ? "accepté" : "refusé");
        return new LivrableTacheDTO(livrable);
    }

    /**
     * Demander une révision d'un livrable.
     */
    public LivrableTacheDTO demanderRevision(Long livrableId, String proprietaireId, String commentaire) {
        log.info("Demande de révision du livrable {} par le propriétaire {}", livrableId, proprietaireId);

        LivrableTache livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));

        // Vérifier les autorisations
        UUID proprietaireUUID = UUID.fromString(proprietaireId);
        if (!livrable.getTache().getProjet().getProprietaireId().equals(proprietaireUUID)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce livrable");
        }

        livrable.setStatut(LivrableTache.StatutLivrable.A_REVISER);
        livrable.setCommentaireValidation(commentaire);
        livrable.setDateValidation(LocalDateTime.now());
        livrable.setValideParId(proprietaireUUID);
        livrable.setDateModification(LocalDateTime.now());
        livrable = livrableRepository.save(livrable);

        log.info("Révision demandée pour le livrable {}", livrableId);
        return new LivrableTacheDTO(livrable);
    }

    /**
     * Obtenir un livrable par son ID.
     */
    @Transactional(readOnly = true)
    public LivrableTacheDTO obtenirLivrable(Long livrableId) {
        LivrableTache livrable = livrableRepository.findByIdAvecCriteres(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));
        return new LivrableTacheDTO(livrable);
    }

    /**
     * Lister les livrables d'une tâche.
     */
    @Transactional(readOnly = true)
    public List<LivrableTacheDTO> listerLivrablesTache(Long tacheId) {
        return livrableRepository.findByTacheId(tacheId)
                .stream()
                .map(LivrableTacheDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lister les livrables en attente de validation pour un projet.
     */
    @Transactional(readOnly = true)
    public List<LivrableTacheDTO> listerLivrablesEnAttenteValidation(Long projetId) {
        return livrableRepository.findLivrablesEnAttenteValidation(projetId)
                .stream()
                .map(LivrableTacheDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Compter les livrables par statut pour une tâche.
     */
    @Transactional(readOnly = true)
    public long compterLivrablesParStatut(Long tacheId, String statut) {
        LivrableTache.StatutLivrable statutEnum = LivrableTache.StatutLivrable.valueOf(statut);
        return livrableRepository.countByTacheIdAndStatut(tacheId, statutEnum);
    }

    /**
     * Ajouter un critère d'acceptation à un livrable.
     */
    public CritereAcceptationLivrableDTO ajouterCritere(Long livrableId, String proprietaireId, String description) {
        log.info("Ajout d'un critère au livrable {} par {}", livrableId, proprietaireId);

        LivrableTache livrable = livrableRepository.findByIdAvecCriteres(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));

        // Vérifier que l'utilisateur est le propriétaire du projet
        UUID proprietaireUUID = UUID.fromString(proprietaireId);
        if (!livrable.getTache().getProjet().getProprietaireId().equals(proprietaireUUID)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce livrable");
        }

        // Déterminer l'ordre du nouveau critère
        Integer maxOrdre = critereRepository.findMaxOrdreByLivrableId(livrableId);
        int nouvelOrdre = maxOrdre != null ? maxOrdre + 1 : 0;

        CritereAcceptationLivrable critere = new CritereAcceptationLivrable(livrable, description);
        critere.setOrdre(nouvelOrdre);
        critere = critereRepository.save(critere);

        log.info("Critère {} ajouté au livrable {}", critere.getId(), livrableId);
        return new CritereAcceptationLivrableDTO(critere);
    }

    /**
     * Supprimer un critère d'acceptation.
     */
    public void supprimerCritere(Long critereId, String proprietaireId) {
        log.info("Suppression du critère {} par {}", critereId, proprietaireId);

        CritereAcceptationLivrable critere = critereRepository.findByIdAvecProjet(critereId)
                .orElseThrow(() -> new RuntimeException("Critère non trouvé: " + critereId));

        // Vérifier que l'utilisateur est le propriétaire du projet
        UUID proprietaireUUID = UUID.fromString(proprietaireId);
        if (!critere.getLivrable().getTache().getProjet().getProprietaireId().equals(proprietaireUUID)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce critère");
        }

        critereRepository.delete(critere);
        log.info("Critère {} supprimé avec succès", critereId);
    }

    /**
     * Supprimer un livrable et tous ses critères.
     */
    public void supprimerLivrable(Long livrableId, String proprietaireId) {
        log.info("Suppression du livrable {} par {}", livrableId, proprietaireId);

        LivrableTache livrable = livrableRepository.findByIdAvecCriteres(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé: " + livrableId));

        // Vérifier que l'utilisateur est le propriétaire du projet
        UUID proprietaireUUID = UUID.fromString(proprietaireId);
        if (!livrable.getTache().getProjet().getProprietaireId().equals(proprietaireUUID)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce livrable");
        }

        // Vérifier que le livrable n'est pas déjà accepté
        if (livrable.getStatut() == LivrableTache.StatutLivrable.ACCEPTE) {
            throw new IllegalStateException("Impossible de supprimer un livrable accepté");
        }

        livrableRepository.delete(livrable);
        log.info("Livrable {} supprimé avec succès", livrableId);
    }

    // Méthodes privées

    private void mettreAJourProgressionTache(TacheProjet tache) {
        long totalLivrables = livrableRepository.countByTacheId(tache.getId());
        long livrablesAcceptes = livrableRepository.countByTacheIdAndStatut(
                tache.getId(), LivrableTache.StatutLivrable.ACCEPTE);

        if (totalLivrables > 0) {
            int progression = (int) ((livrablesAcceptes * 100) / totalLivrables);
            tache.setProgression(progression);
            tacheRepository.save(tache);
        }
    }
}
