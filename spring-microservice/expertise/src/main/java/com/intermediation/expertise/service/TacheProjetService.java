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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

    public TacheProjetService(TacheProjetRepository tacheRepository,
                              ProjetRepository projetRepository,
                              EtapeProjetRepository etapeRepository,
                              LivrableTacheRepository livrableRepository,
                              CompetenceReferenceRepository competenceReferenceRepository,
                              CommentaireTacheRepository commentaireRepository) {
        this.tacheRepository = tacheRepository;
        this.projetRepository = projetRepository;
        this.etapeRepository = etapeRepository;
        this.livrableRepository = livrableRepository;
        this.competenceReferenceRepository = competenceReferenceRepository;
        this.commentaireRepository = commentaireRepository;
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
        boolean estProprietaire = tache.getProjet().getProprietaireId().equals(utilisateurId);
        boolean estExpertAssigne = utilisateurId.equals(tache.getExpertAssigneId());

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

        tache.assignerExpert(expertId);
        tache = tacheRepository.save(tache);

        log.info("Expert {} assigné à la tâche {} avec succès", expertId, tacheId);
        return new TacheProjetDTO(tache);
    }

    /**
     * Désassigner un expert d'une tâche.
     */
    public TacheProjetDTO desassignerExpert(Long tacheId, String proprietaireId) {
        log.info("Désassignation de l'expert de la tâche {}", tacheId);

        TacheProjet tache = obtenirTacheVerifieeProprietaire(tacheId, proprietaireId);

        tache.setExpertAssigneId(null);
        tache.setDateAssignation(null);
        tache.setStatut(TacheProjet.StatutTache.A_FAIRE);
        tache.setDateModification(LocalDateTime.now());
        tache = tacheRepository.save(tache);

        log.info("Expert désassigné de la tâche {} avec succès", tacheId);
        return new TacheProjetDTO(tache);
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
        return new TacheProjetDTO(tache);
    }

    /**
     * Obtenir une tâche avec tous ses détails.
     */
    @Transactional(readOnly = true)
    public TacheProjetDTO obtenirTacheComplete(Long tacheId) {
        TacheProjet tache = tacheRepository.findByIdAvecDetails(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));
        return new TacheProjetDTO(tache);
    }

    /**
     * Lister les tâches d'un projet.
     */
    @Transactional(readOnly = true)
    public List<TacheProjetDTO> listerTachesProjet(Long projetId) {
        return tacheRepository.findByProjetIdOrderByOrdreAsc(projetId)
                .stream()
                .map(TacheProjetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lister les tâches assignées à un expert.
     */
    @Transactional(readOnly = true)
    public List<TacheProjetDTO> listerMesTaches(String expertId) {
        return tacheRepository.findByExpertAssigneIdOrderByDateAssignationDesc(expertId)
                .stream()
                .map(TacheProjetDTO::new)
                .collect(Collectors.toList());
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

        CommentaireTache commentaire = new CommentaireTache(tache, auteurId, request.getContenu());

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
        if (!projet.getProprietaireId().equals(proprietaireId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce projet");
        }
    }
}
