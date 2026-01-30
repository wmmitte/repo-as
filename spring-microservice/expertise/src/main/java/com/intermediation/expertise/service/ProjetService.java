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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des projets.
 */
@Service
@Transactional
public class ProjetService {

    private static final Logger log = LoggerFactory.getLogger(ProjetService.class);

    private final ProjetRepository projetRepository;
    private final EtapeProjetRepository etapeRepository;
    private final TacheProjetRepository tacheRepository;
    private final ExigenceProjetRepository exigenceRepository;

    public ProjetService(ProjetRepository projetRepository,
                         EtapeProjetRepository etapeRepository,
                         TacheProjetRepository tacheRepository,
                         ExigenceProjetRepository exigenceRepository) {
        this.projetRepository = projetRepository;
        this.etapeRepository = etapeRepository;
        this.tacheRepository = tacheRepository;
        this.exigenceRepository = exigenceRepository;
    }

    /**
     * Créer un nouveau projet.
     */
    public ProjetDTO creerProjet(String proprietaireId, CreerProjetRequest request) {
        log.info("Création d'un nouveau projet pour l'utilisateur {}", proprietaireId);

        Projet projet = new Projet(UUID.fromString(proprietaireId), request.getNom());
        projet.setDescription(request.getDescription());
        projet.setBudget(request.getBudget());
        projet.setDevise(request.getDevise() != null ? request.getDevise() : "FCFA");
        projet.setVisibilite(Projet.Visibilite.valueOf(
                request.getVisibilite() != null ? request.getVisibilite() : "PRIVE"));
        projet.setDateDebutPrevue(request.getDateDebutPrevue());
        projet.setDateFinPrevue(request.getDateFinPrevue());

        projet = projetRepository.save(projet);

        // Ajouter les exigences si fournies
        if (request.getExigences() != null && !request.getExigences().isEmpty()) {
            int ordre = 0;
            for (String descExigence : request.getExigences()) {
                ExigenceProjet exigence = new ExigenceProjet(projet, descExigence);
                exigence.setOrdre(ordre++);
                projet.ajouterExigence(exigence);
            }
            projet = projetRepository.save(projet);
        }

        log.info("Projet créé avec succès: id={}, nom={}", projet.getId(), projet.getNom());
        return new ProjetDTO(projet);
    }

    /**
     * Modifier un projet existant.
     */
    public ProjetDTO modifierProjet(Long projetId, String proprietaireId, ModifierProjetRequest request) {
        log.info("Modification du projet {} par l'utilisateur {}", projetId, proprietaireId);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);

        if (request.getNom() != null) {
            projet.setNom(request.getNom());
        }
        if (request.getDescription() != null) {
            projet.setDescription(request.getDescription());
        }
        if (request.getBudget() != null) {
            projet.setBudget(request.getBudget());
        }
        if (request.getDevise() != null) {
            projet.setDevise(request.getDevise());
        }
        if (request.getVisibilite() != null) {
            projet.setVisibilite(Projet.Visibilite.valueOf(request.getVisibilite()));
        }
        if (request.getDateDebutPrevue() != null) {
            projet.setDateDebutPrevue(request.getDateDebutPrevue());
        }
        if (request.getDateFinPrevue() != null) {
            projet.setDateFinPrevue(request.getDateFinPrevue());
        }

        projet.setDateModification(LocalDateTime.now());
        projet = projetRepository.save(projet);

        log.info("Projet {} modifié avec succès", projetId);
        return new ProjetDTO(projet);
    }

    /**
     * Publier un projet (le rendre visible publiquement).
     */
    public ProjetDTO publierProjet(Long projetId, String proprietaireId) {
        log.info("Publication du projet {} par l'utilisateur {}", projetId, proprietaireId);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);

        if (projet.getStatut() != Projet.StatutProjet.BROUILLON) {
            throw new IllegalStateException("Le projet ne peut être publié que depuis l'état BROUILLON");
        }

        projet.setStatut(Projet.StatutProjet.PUBLIE);
        projet.setVisibilite(Projet.Visibilite.PUBLIC);
        projet.setDateModification(LocalDateTime.now());
        projet = projetRepository.save(projet);

        log.info("Projet {} publié avec succès", projetId);
        return new ProjetDTO(projet);
    }

    /**
     * Dépublier un projet (le rendre privé).
     */
    public ProjetDTO depublierProjet(Long projetId, String proprietaireId) {
        log.info("Dépublication du projet {} par l'utilisateur {}", projetId, proprietaireId);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);

        projet.setStatut(Projet.StatutProjet.BROUILLON);
        projet.setVisibilite(Projet.Visibilite.PRIVE);
        projet.setDateModification(LocalDateTime.now());
        projet = projetRepository.save(projet);

        log.info("Projet {} dépublié avec succès", projetId);
        return new ProjetDTO(projet);
    }

    /**
     * Changer le statut d'un projet.
     */
    public ProjetDTO changerStatut(Long projetId, String proprietaireId, String nouveauStatut) {
        log.info("Changement de statut du projet {} vers {}", projetId, nouveauStatut);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);
        Projet.StatutProjet statut = Projet.StatutProjet.valueOf(nouveauStatut);

        // Vérifier les transitions de statut valides
        validerTransitionStatut(projet.getStatut(), statut);

        projet.setStatut(statut);
        projet.setDateModification(LocalDateTime.now());

        // Mettre à jour les dates effectives selon le statut
        if (statut == Projet.StatutProjet.EN_COURS && projet.getDateDebutEffective() == null) {
            projet.setDateDebutEffective(java.time.LocalDate.now());
        } else if (statut == Projet.StatutProjet.TERMINE) {
            projet.setDateFinEffective(java.time.LocalDate.now());
        }

        projet = projetRepository.save(projet);
        log.info("Statut du projet {} changé en {}", projetId, nouveauStatut);
        return new ProjetDTO(projet);
    }

    /**
     * Supprimer un projet (soft delete ou réel selon statut).
     */
    public void supprimerProjet(Long projetId, String proprietaireId) {
        log.info("Suppression du projet {} par l'utilisateur {}", projetId, proprietaireId);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);

        // Ne pas permettre la suppression si le projet est en cours
        if (projet.getStatut() == Projet.StatutProjet.EN_COURS) {
            throw new IllegalStateException("Impossible de supprimer un projet en cours");
        }

        projetRepository.delete(projet);
        log.info("Projet {} supprimé avec succès", projetId);
    }

    /**
     * Obtenir un projet par son ID.
     */
    @Transactional(readOnly = true)
    public ProjetDTO obtenirProjet(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));
        return new ProjetDTO(projet);
    }

    /**
     * Obtenir un projet complet avec toutes ses relations.
     */
    @Transactional(readOnly = true)
    public ProjetDTO obtenirProjetComplet(Long projetId) {
        Projet projet = projetRepository.findByIdAvecEtapesEtTaches(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));
        return new ProjetDTO(projet);
    }

    /**
     * Lister les projets d'un propriétaire.
     */
    @Transactional(readOnly = true)
    public List<ProjetResumeDTO> listerMesProjets(String proprietaireId) {
        return projetRepository.findByProprietaireIdOrderByDateCreationDesc(UUID.fromString(proprietaireId))
                .stream()
                .map(ProjetResumeDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lister les projets publics (pour le feed).
     */
    @Transactional(readOnly = true)
    public Page<ProjetResumeDTO> listerProjetsPublics(Pageable pageable) {
        return projetRepository.findProjetsPublics(pageable)
                .map(ProjetResumeDTO::new);
    }

    /**
     * Rechercher des projets publics.
     */
    @Transactional(readOnly = true)
    public Page<ProjetResumeDTO> rechercherProjetsPublics(String recherche, Pageable pageable) {
        return projetRepository.rechercherProjetsPublics(recherche, pageable)
                .map(ProjetResumeDTO::new);
    }

    /**
     * Lister les projets avec des tâches disponibles.
     */
    @Transactional(readOnly = true)
    public Page<ProjetResumeDTO> listerProjetsAvecTachesDisponibles(Pageable pageable) {
        return projetRepository.findProjetsAvecTachesDisponibles(pageable)
                .map(ProjetResumeDTO::new);
    }

    /**
     * Créer une étape dans un projet.
     */
    public EtapeProjetDTO creerEtape(String proprietaireId, CreerEtapeRequest request) {
        log.info("Création d'une étape pour le projet {}", request.getProjetId());

        Projet projet = obtenirProjetVerifieProprietaire(request.getProjetId(), proprietaireId);

        EtapeProjet etape = new EtapeProjet(projet, request.getNom());
        etape.setDescription(request.getDescription());
        etape.setDateDebutPrevue(request.getDateDebutPrevue());
        etape.setDateFinPrevue(request.getDateFinPrevue());

        // Définir l'ordre
        if (request.getOrdre() != null) {
            etape.setOrdre(request.getOrdre());
        } else {
            Integer maxOrdre = etapeRepository.findMaxOrdreByProjetId(projet.getId());
            etape.setOrdre(maxOrdre != null ? maxOrdre + 1 : 0);
        }

        etape = etapeRepository.save(etape);
        log.info("Étape créée avec succès: id={}", etape.getId());
        return new EtapeProjetDTO(etape);
    }

    /**
     * Supprimer une étape.
     */
    public void supprimerEtape(Long etapeId, String proprietaireId) {
        log.info("Suppression de l'étape {}", etapeId);

        EtapeProjet etape = etapeRepository.findById(etapeId)
                .orElseThrow(() -> new RuntimeException("Étape non trouvée: " + etapeId));

        verifierProprietaire(etape.getProjet(), proprietaireId);

        // Les tâches de l'étape deviennent indépendantes
        for (TacheProjet tache : etape.getTaches()) {
            tache.setEtape(null);
            tacheRepository.save(tache);
        }

        etapeRepository.delete(etape);
        log.info("Étape {} supprimée avec succès", etapeId);
    }

    /**
     * Ajouter une exigence à un projet.
     */
    public ExigenceProjetDTO ajouterExigence(Long projetId, String proprietaireId, String description) {
        log.info("Ajout d'une exigence au projet {}", projetId);

        Projet projet = obtenirProjetVerifieProprietaire(projetId, proprietaireId);

        Integer maxOrdre = exigenceRepository.findMaxOrdreByProjetId(projetId);
        int ordre = maxOrdre != null ? maxOrdre + 1 : 0;

        ExigenceProjet exigence = new ExigenceProjet(projet, description);
        exigence.setOrdre(ordre);
        exigence = exigenceRepository.save(exigence);

        log.info("Exigence ajoutée avec succès: id={}", exigence.getId());
        return new ExigenceProjetDTO(exigence);
    }

    /**
     * Supprimer une exigence.
     */
    public void supprimerExigence(Long exigenceId, String proprietaireId) {
        ExigenceProjet exigence = exigenceRepository.findById(exigenceId)
                .orElseThrow(() -> new RuntimeException("Exigence non trouvée: " + exigenceId));

        if (!exigenceRepository.existsByIdAndProjet_ProprietaireId(exigenceId, UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette exigence");
        }

        exigenceRepository.delete(exigence);
        log.info("Exigence {} supprimée avec succès", exigenceId);
    }

    /**
     * Incrémenter le nombre de vues d'un projet.
     */
    public void incrementerVues(Long projetId) {
        projetRepository.findById(projetId).ifPresent(projet -> {
            projet.setNombreVues(projet.getNombreVues() + 1);
            projetRepository.save(projet);
        });
    }

    // Méthodes privées

    private Projet obtenirProjetVerifieProprietaire(Long projetId, String proprietaireId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));

        verifierProprietaire(projet, proprietaireId);
        return projet;
    }

    private void verifierProprietaire(Projet projet, String proprietaireId) {
        if (!projet.getProprietaireId().equals(UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce projet");
        }
    }

    private void validerTransitionStatut(Projet.StatutProjet actuel, Projet.StatutProjet nouveau) {
        // Définir les transitions valides
        boolean transitionValide = switch (actuel) {
            case BROUILLON -> nouveau == Projet.StatutProjet.PUBLIE;
            case PUBLIE -> nouveau == Projet.StatutProjet.EN_COURS ||
                    nouveau == Projet.StatutProjet.BROUILLON ||
                    nouveau == Projet.StatutProjet.ANNULE;
            case EN_COURS -> nouveau == Projet.StatutProjet.EN_PAUSE ||
                    nouveau == Projet.StatutProjet.TERMINE ||
                    nouveau == Projet.StatutProjet.ANNULE;
            case EN_PAUSE -> nouveau == Projet.StatutProjet.EN_COURS ||
                    nouveau == Projet.StatutProjet.ANNULE;
            case TERMINE, ANNULE -> false;
        };

        if (!transitionValide) {
            throw new IllegalStateException(
                    String.format("Transition de statut invalide: %s vers %s", actuel, nouveau));
        }
    }
}
