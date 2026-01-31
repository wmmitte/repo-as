package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intermediation.expertise.dto.UtilisateurRhDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des tâches de projet.
 */
@Service
@Transactional
public class TacheProjetService {

    private static final Logger log = LoggerFactory.getLogger(TacheProjetService.class);

    private final TacheProjetRepository tacheRepository;
    private final ProjetRepository projetRepository;
    private final EtapeProjetRepository etapeRepository;
    private final LivrableTacheRepository livrableRepository;
    private final CompetenceReferenceRepository competenceReferenceRepository;
    private final CommentaireTacheRepository commentaireRepository;
    private final NotificationService notificationService;
    private final UtilisateurRhService utilisateurService;

    public TacheProjetService(TacheProjetRepository tacheRepository,
                              ProjetRepository projetRepository,
                              EtapeProjetRepository etapeRepository,
                              LivrableTacheRepository livrableRepository,
                              CompetenceReferenceRepository competenceReferenceRepository,
                              CommentaireTacheRepository commentaireRepository,
                              NotificationService notificationService,
                              UtilisateurRhService utilisateurService) {
        this.tacheRepository = tacheRepository;
        this.projetRepository = projetRepository;
        this.etapeRepository = etapeRepository;
        this.livrableRepository = livrableRepository;
        this.competenceReferenceRepository = competenceReferenceRepository;
        this.commentaireRepository = commentaireRepository;
        this.notificationService = notificationService;
        this.utilisateurService = utilisateurService;
    }

    /**
     * Créer une nouvelle tâche.
     */
    public TacheProjetDTO creerTache(String proprietaireId, CreerTacheRequest request) {
        log.info("Création d'une tâche pour le projet {}", request.getProjetId());

        Projet projet = projetRepository.findById(request.getProjetId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + request.getProjetId()));

        verifierProprietaire(projet, proprietaireId);

        TacheProjet tache = new TacheProjet(projet, request.getNom());
        tache.setDescription(request.getDescription());
        tache.setBudget(request.getBudget());
        tache.setDelaiJours(request.getDelaiJours());
        tache.setDateDebutPrevue(request.getDateDebutPrevue());
        tache.setDateFinPrevue(request.getDateFinPrevue());

        if (request.getVisibilite() != null) {
            tache.setVisibilite(TacheProjet.VisibiliteTache.valueOf(request.getVisibilite()));
        }
        if (request.getPriorite() != null) {
            tache.setPriorite(TacheProjet.Priorite.valueOf(request.getPriorite()));
        }

        // Associer à une étape si spécifié
        if (request.getEtapeId() != null) {
            EtapeProjet etape = etapeRepository.findById(request.getEtapeId())
                    .orElseThrow(() -> new RuntimeException("Étape non trouvée: " + request.getEtapeId()));
            tache.setEtape(etape);

            // Définir l'ordre dans l'étape
            if (request.getOrdre() != null) {
                tache.setOrdre(request.getOrdre());
            } else {
                Integer maxOrdre = tacheRepository.findMaxOrdreByEtapeId(etape.getId());
                tache.setOrdre(maxOrdre != null ? maxOrdre + 1 : 0);
            }
        } else {
            // Tâche indépendante - définir l'ordre dans le projet
            if (request.getOrdre() != null) {
                tache.setOrdre(request.getOrdre());
            } else {
                Integer maxOrdre = tacheRepository.findMaxOrdreByProjetIdSansEtape(projet.getId());
                tache.setOrdre(maxOrdre != null ? maxOrdre + 1 : 0);
            }
        }

        tache = tacheRepository.save(tache);

        // Ajouter les compétences requises
        if (request.getCompetencesRequises() != null) {
            for (CreerTacheRequest.CompetenceRequiseRequest compReq : request.getCompetencesRequises()) {
                CompetenceReference competenceRef = competenceReferenceRepository
                        .findById(compReq.getCompetenceReferenceId())
                        .orElseThrow(() -> new RuntimeException(
                                "Compétence de référence non trouvée: " + compReq.getCompetenceReferenceId()));

                TacheCompetenceRequise competenceRequise = new TacheCompetenceRequise(
                        tache, competenceRef, compReq.getNiveauRequis(), compReq.getEstObligatoire());
                tache.ajouterCompetenceRequise(competenceRequise);
            }
        }

        // Ajouter les livrables
        if (request.getLivrables() != null) {
            for (CreerTacheRequest.LivrableRequest livReq : request.getLivrables()) {
                LivrableTache livrable = new LivrableTache(tache, livReq.getNom());
                livrable.setDescription(livReq.getDescription());
                tache.ajouterLivrable(livrable);

                // Ajouter les critères d'acceptation
                if (livReq.getCriteresAcceptation() != null) {
                    int ordre = 0;
                    for (String critereDesc : livReq.getCriteresAcceptation()) {
                        CritereAcceptationLivrable critere = new CritereAcceptationLivrable(livrable, critereDesc);
                        critere.setOrdre(ordre++);
                        livrable.ajouterCritere(critere);
                    }
                }
            }
        }

        tache = tacheRepository.save(tache);
        log.info("Tâche créée avec succès: id={}", tache.getId());
        return new TacheProjetDTO(tache);
    }

    /**
     * Modifier une tâche existante.
     */
    public TacheProjetDTO modifierTache(Long tacheId, String proprietaireId, ModifierTacheRequest request) {
        log.info("Modification de la tâche {}", tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        if (request.getNom() != null) {
            tache.setNom(request.getNom());
        }
        if (request.getDescription() != null) {
            tache.setDescription(request.getDescription());
        }
        if (request.getOrdre() != null) {
            tache.setOrdre(request.getOrdre());
        }
        if (request.getBudget() != null) {
            tache.setBudget(request.getBudget());
        }
        if (request.getDelaiJours() != null) {
            tache.setDelaiJours(request.getDelaiJours());
        }
        if (request.getVisibilite() != null) {
            tache.setVisibilite(TacheProjet.VisibiliteTache.valueOf(request.getVisibilite()));
        }
        if (request.getPriorite() != null) {
            tache.setPriorite(TacheProjet.Priorite.valueOf(request.getPriorite()));
        }
        if (request.getProgression() != null) {
            tache.setProgression(request.getProgression());
        }
        if (request.getDateDebutPrevue() != null) {
            tache.setDateDebutPrevue(request.getDateDebutPrevue());
        }
        if (request.getDateFinPrevue() != null) {
            tache.setDateFinPrevue(request.getDateFinPrevue());
        }

        tache.setDateModification(LocalDateTime.now());
        tache = tacheRepository.save(tache);

        // Mettre à jour la progression du projet
        tache.getProjet().calculerProgression();
        projetRepository.save(tache.getProjet());

        log.info("Tâche {} modifiée avec succès", tacheId);
        return new TacheProjetDTO(tache);
    }

    /**
     * Changer le statut d'une tâche.
     */
    public TacheProjetDTO changerStatut(Long tacheId, String utilisateurId, String nouveauStatut) {
        log.info("Changement de statut de la tâche {} vers {}", tacheId, nouveauStatut);

        TacheProjet tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));

        // Vérifier que l'utilisateur est le propriétaire ou l'expert assigné
        UUID utilisateurUUID = UUID.fromString(utilisateurId);
        boolean estProprietaire = tache.getProjet().getProprietaireId().equals(utilisateurUUID);
        boolean estExpertAssigne = utilisateurUUID.equals(tache.getExpertAssigneId());

        if (!estProprietaire && !estExpertAssigne) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette tâche");
        }

        TacheProjet.StatutTache statut = TacheProjet.StatutTache.valueOf(nouveauStatut);
        tache.setStatut(statut);
        tache.setDateModification(LocalDateTime.now());

        // Mettre à jour les dates effectives
        if (statut == TacheProjet.StatutTache.EN_COURS && tache.getDateDebutEffective() == null) {
            tache.setDateDebutEffective(LocalDate.now());
        } else if (statut == TacheProjet.StatutTache.TERMINEE) {
            tache.setDateFinEffective(LocalDate.now());
            tache.setProgression(100);
        }

        tache = tacheRepository.save(tache);

        // Mettre à jour la progression du projet
        tache.getProjet().calculerProgression();
        projetRepository.save(tache.getProjet());

        log.info("Statut de la tâche {} changé en {}", tacheId, nouveauStatut);
        return new TacheProjetDTO(tache);
    }

    /**
     * Assigner un expert à une tâche.
     */
    public TacheProjetDTO assignerExpert(Long tacheId, String proprietaireId, String expertId) {
        log.info("Assignation de l'expert {} à la tâche {}", expertId, tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        if (tache.getExpertAssigneId() != null) {
            throw new IllegalStateException("Cette tâche est déjà assignée à un expert");
        }

        tache.assignerExpert(UUID.fromString(expertId));
        tache = tacheRepository.save(tache);

        // Envoyer une notification à l'expert
        notificationService.notifierAssignationTaches(
            UUID.fromString(expertId),
            tache.getProjet(),
            List.of(tache)
        );

        log.info("Expert {} assigné à la tâche {} avec succès", expertId, tacheId);
        return new TacheProjetDTO(tache);
    }

    /**
     * Assigner un expert à plusieurs tâches en lot.
     * Envoie une seule notification pour toutes les tâches.
     */
    public List<TacheProjetDTO> assignerExpertEnLot(List<Long> tacheIds, String proprietaireId, String expertId) {
        log.info("Assignation de l'expert {} à {} tâche(s)", expertId, tacheIds.size());

        if (tacheIds.isEmpty()) {
            return List.of();
        }

        UUID expertUuid = UUID.fromString(expertId);
        Projet projet = null;
        List<TacheProjet> tachesAssignees = new java.util.ArrayList<>();

        for (Long tacheId : tacheIds) {
            TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

            if (tache.getExpertAssigneId() != null) {
                log.warn("Tâche {} déjà assignée, ignorée", tacheId);
                continue;
            }

            tache.assignerExpert(expertUuid);
            tache = tacheRepository.save(tache);
            tachesAssignees.add(tache);

            if (projet == null) {
                projet = tache.getProjet();
            }
        }

        // Envoyer une seule notification pour toutes les tâches
        if (!tachesAssignees.isEmpty() && projet != null) {
            notificationService.notifierAssignationTaches(expertUuid, projet, tachesAssignees);
        }

        log.info("Expert {} assigné à {} tâche(s) avec succès", expertId, tachesAssignees.size());
        return tachesAssignees.stream()
                .map(TacheProjetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Désassigner un expert d'une tâche.
     * Réinitialise les livrables non-acceptés et notifie l'expert.
     */
    public TacheProjetDTO desassignerExpert(Long tacheId, String proprietaireId, String motif) {
        log.info("Désassignation de l'expert de la tâche {}", tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        UUID ancienExpertId = tache.getExpertAssigneId();

        // Réinitialiser les livrables non-acceptés à A_FOURNIR
        if (tache.getLivrables() != null) {
            for (LivrableTache livrable : tache.getLivrables()) {
                if (livrable.getStatut() != LivrableTache.StatutLivrable.ACCEPTE) {
                    livrable.setStatut(LivrableTache.StatutLivrable.A_FOURNIR);
                    livrable.setFichierUrl(null);
                    livrable.setFichierNom(null);
                    livrable.setFichierTaille(null);
                    livrable.setFichierType(null);
                    livrable.setDateSoumission(null);
                    livrable.setCommentaireSoumission(null);
                    livrable.setValideParId(null);
                    livrable.setDateValidation(null);
                    livrable.setCommentaireValidation(null);
                }
            }
        }

        // Réinitialiser la tâche
        tache.setExpertAssigneId(null);
        tache.setDateAssignation(null);
        tache.setStatut(TacheProjet.StatutTache.A_FAIRE);
        tache.setProgression(0);
        tache.setDateModification(LocalDateTime.now());
        tache = tacheRepository.save(tache);

        // Recalculer la progression du projet
        Projet projet = tache.getProjet();
        if (projet != null) {
            projet.calculerProgression();
            log.info("Progression du projet {} mise à jour: {}%", projet.getId(), projet.getProgression());
        }

        // Notifier l'ancien expert qu'il a été retiré
        if (ancienExpertId != null) {
            notificationService.notifierRetraitTache(ancienExpertId, tache, motif);
        }

        log.info("Expert désassigné de la tâche {} avec succès", tacheId);
        return new TacheProjetDTO(tache);
    }

    /**
     * Désassigner un expert d'une tâche (sans motif).
     */
    public TacheProjetDTO desassignerExpert(Long tacheId, String proprietaireId) {
        return desassignerExpert(tacheId, proprietaireId, null);
    }

    /**
     * Supprimer une tâche.
     */
    public void supprimerTache(Long tacheId, String proprietaireId) {
        log.info("Suppression de la tâche {}", tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        // Ne pas permettre la suppression si la tâche est en cours
        if (tache.getStatut() == TacheProjet.StatutTache.EN_COURS) {
            throw new IllegalStateException("Impossible de supprimer une tâche en cours");
        }

        tacheRepository.delete(tache);
        log.info("Tâche {} supprimée avec succès", tacheId);
    }

    /**
     * Obtenir une tâche par son ID.
     */
    @Transactional(readOnly = true)
    public TacheProjetDTO obtenirTache(Long tacheId) {
        TacheProjet tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));
        return enrichirAvecInfosExpert(new TacheProjetDTO(tache));
    }

    /**
     * Obtenir une tâche avec tous ses détails.
     */
    @Transactional(readOnly = true)
    public TacheProjetDTO obtenirTacheComplete(Long tacheId) {
        TacheProjet tache = tacheRepository.findByIdAvecDetails(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));
        return enrichirAvecInfosExpert(new TacheProjetDTO(tache));
    }

    /**
     * Lister les tâches d'un projet.
     */
    @Transactional(readOnly = true)
    public List<TacheProjetDTO> listerTachesProjet(Long projetId) {
        List<TacheProjetDTO> dtos = tacheRepository.findByProjetIdOrderByOrdreAsc(projetId)
                .stream()
                .map(TacheProjetDTO::new)
                .collect(Collectors.toList());
        return enrichirListeAvecInfosExperts(dtos);
    }

    /**
     * Lister les tâches assignées à un expert.
     */
    @Transactional(readOnly = true)
    public List<TacheProjetDTO> listerMesTaches(String expertId) {
        List<TacheProjetDTO> dtos = tacheRepository.findByExpertAssigneIdOrderByDateAssignationDesc(UUID.fromString(expertId))
                .stream()
                .map(TacheProjetDTO::new)
                .collect(Collectors.toList());
        return enrichirListeAvecInfosExperts(dtos);
    }

    /**
     * Lister les tâches disponibles (publiques, non assignées).
     */
    @Transactional(readOnly = true)
    public Page<TacheProjetDTO> listerTachesDisponibles(Pageable pageable) {
        return tacheRepository.findTachesDisponibles(pageable)
                .map(TacheProjetDTO::new);
    }

    /**
     * Lister les tâches disponibles correspondant aux compétences.
     */
    @Transactional(readOnly = true)
    public Page<TacheProjetDTO> listerTachesDisponiblesParCompetences(List<Long> competenceIds, Pageable pageable) {
        return tacheRepository.findTachesDisponiblesParCompetences(competenceIds, pageable)
                .map(TacheProjetDTO::new);
    }

    /**
     * Ajouter un livrable à une tâche.
     */
    public LivrableTacheDTO ajouterLivrable(Long tacheId, String proprietaireId, String nom, String description) {
        log.info("Ajout d'un livrable à la tâche {}", tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        LivrableTache livrable = new LivrableTache(tache, nom);
        livrable.setDescription(description);
        livrable = livrableRepository.save(livrable);

        log.info("Livrable ajouté avec succès: id={}", livrable.getId());
        return new LivrableTacheDTO(livrable);
    }

    /**
     * Ajouter un commentaire à une tâche.
     */
    public CommentaireTacheDTO ajouterCommentaire(String auteurId, CreerCommentaireRequest request) {
        log.info("Ajout d'un commentaire à la tâche {}", request.getTacheId());

        TacheProjet tache = tacheRepository.findById(request.getTacheId())
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + request.getTacheId()));

        CommentaireTache commentaire = new CommentaireTache(tache, UUID.fromString(auteurId), request.getContenu());

        // Si c'est une réponse à un autre commentaire
        if (request.getParentId() != null) {
            CommentaireTache parent = commentaireRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Commentaire parent non trouvé: " + request.getParentId()));
            commentaire.setParent(parent);
        }

        commentaire = commentaireRepository.save(commentaire);
        log.info("Commentaire ajouté avec succès: id={}", commentaire.getId());
        return new CommentaireTacheDTO(commentaire);
    }

    /**
     * Lister les commentaires d'une tâche.
     */
    @Transactional(readOnly = true)
    public List<CommentaireTacheDTO> listerCommentaires(Long tacheId) {
        return commentaireRepository.findCommentairesRacinesParTache(tacheId)
                .stream()
                .map(CommentaireTacheDTO::new)
                .collect(Collectors.toList());
    }

    // Méthodes privées

    private TacheProjet obtenirTacheVerifieeProprietaire(Long tacheId, String proprietaireId) {
        TacheProjet tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));

        verifierProprietaire(tache.getProjet(), proprietaireId);
        return tache;
    }

    private void verifierProprietaire(Projet projet, String proprietaireId) {
        if (!projet.getProprietaireId().equals(UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce projet");
        }
    }

    /**
     * Enrichit un DTO de tâche avec les informations de l'expert assigné.
     */
    private TacheProjetDTO enrichirAvecInfosExpert(TacheProjetDTO dto) {
        if (dto.getExpertAssigneId() != null) {
            try {
                UtilisateurRhDTO expert = utilisateurService.getUtilisateurRhParId(dto.getExpertAssigneId());
                if (expert != null) {
                    // Extraire nom et prénom du nom complet si nécessaire
                    String nomComplet = expert.getNom();
                    if (nomComplet != null && nomComplet.contains(" ")) {
                        String[] parts = nomComplet.split(" ", 2);
                        dto.setExpertPrenom(parts[0]);
                        dto.setExpertNom(parts.length > 1 ? parts[1] : null);
                    } else {
                        dto.setExpertNom(nomComplet);
                    }

                    // Utiliser prenom et photoUrl directement si disponibles
                    if (expert.getPrenom() != null) {
                        dto.setExpertPrenom(expert.getPrenom());
                    }
                    dto.setExpertPhotoUrl(expert.getPhotoUrl());
                }
            } catch (Exception e) {
                log.warn("Impossible de récupérer les infos de l'expert {}: {}", dto.getExpertAssigneId(), e.getMessage());
            }
        }
        return dto;
    }

    /**
     * Enrichit une liste de DTOs de tâches avec les informations des experts assignés.
     */
    private List<TacheProjetDTO> enrichirListeAvecInfosExperts(List<TacheProjetDTO> dtos) {
        for (TacheProjetDTO dto : dtos) {
            enrichirAvecInfosExpert(dto);
        }
        return dtos;
    }
}
