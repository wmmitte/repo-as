package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des candidatures sur les projets et tâches.
 */
@Service
@Transactional
public class CandidatureProjetService {

    private static final Logger log = LoggerFactory.getLogger(CandidatureProjetService.class);

    private final CandidatureProjetRepository candidatureRepository;
    private final ProjetRepository projetRepository;
    private final TacheProjetRepository tacheRepository;
    private final ExpertiseRepository expertiseRepository;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    public CandidatureProjetService(CandidatureProjetRepository candidatureRepository,
                                    ProjetRepository projetRepository,
                                    TacheProjetRepository tacheRepository,
                                    ExpertiseRepository expertiseRepository) {
        this.candidatureRepository = candidatureRepository;
        this.projetRepository = projetRepository;
        this.tacheRepository = tacheRepository;
        this.expertiseRepository = expertiseRepository;
    }

    /**
     * Créer une candidature sur un projet ou une tâche.
     */
    public CandidatureProjetDTO creerCandidature(String expertId, CreerCandidatureRequest request) {
        log.info("Création d'une candidature par l'expert {} sur le projet {}", expertId, request.getProjetId());

        Projet projet = projetRepository.findById(request.getProjetId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + request.getProjetId()));

        // Vérifier que le projet est public et publié
        if (!projet.estPublic()) {
            throw new IllegalStateException("Ce projet n'est pas ouvert aux candidatures");
        }

        // Vérifier que l'expert n'est pas le propriétaire
        UUID expertUUID = UUID.fromString(expertId);
        if (projet.getProprietaireId().equals(expertUUID)) {
            throw new IllegalStateException("Vous ne pouvez pas candidater sur votre propre projet");
        }

        TacheProjet tache = null;
        if (request.getTacheId() != null) {
            tache = tacheRepository.findById(request.getTacheId())
                    .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + request.getTacheId()));

            // Vérifier que la tâche appartient au projet
            if (!tache.getProjet().getId().equals(projet.getId())) {
                throw new IllegalStateException("Cette tâche n'appartient pas au projet spécifié");
            }

            // Vérifier que la tâche est disponible
            if (!tache.estDisponible()) {
                throw new IllegalStateException("Cette tâche n'est plus disponible");
            }

            // Vérifier qu'il n'y a pas déjà une candidature active sur cette tâche
            if (candidatureRepository.existsCandidatureActiveTache(tache.getId(), expertUUID)) {
                throw new IllegalStateException("Vous avez déjà une candidature active sur cette tâche");
            }
        } else {
            // Candidature sur le projet entier
            if (candidatureRepository.existsCandidatureActiveProjet(projet.getId(), expertUUID)) {
                throw new IllegalStateException("Vous avez déjà une candidature active sur ce projet");
            }
        }

        CandidatureProjet candidature;
        if (tache != null) {
            candidature = new CandidatureProjet(projet, tache, expertUUID);
        } else {
            candidature = new CandidatureProjet(projet, expertUUID);
        }

        candidature.setMessage(request.getMessage());
        candidature.setTarifPropose(request.getTarifPropose());
        candidature.setDelaiProposeJours(request.getDelaiProposeJours());

        candidature = candidatureRepository.save(candidature);

        log.info("Candidature créée avec succès: id={}", candidature.getId());
        return new CandidatureProjetDTO(candidature);
    }

    /**
     * Répondre à une candidature (accepter, refuser, mettre en discussion).
     */
    public CandidatureProjetDTO repondreCandidature(Long candidatureId, String proprietaireId,
                                                     RepondreCandidatureRequest request) {
        log.info("Réponse à la candidature {} par le propriétaire {}", candidatureId, proprietaireId);

        CandidatureProjet candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée: " + candidatureId));

        // Vérifier que l'utilisateur est le propriétaire du projet
        if (!candidature.getProjet().getProprietaireId().equals(UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à répondre à cette candidature");
        }

        // Vérifier que la candidature est en attente ou en discussion
        if (candidature.getStatut() != CandidatureProjet.StatutCandidature.EN_ATTENTE &&
                candidature.getStatut() != CandidatureProjet.StatutCandidature.EN_DISCUSSION) {
            throw new IllegalStateException("Cette candidature ne peut plus être modifiée");
        }

        String action = request.getAction().toUpperCase();
        switch (action) {
            case "ACCEPTER":
                candidature.accepter(request.getReponse());
                // Assigner l'expert à la tâche si c'est une candidature sur une tâche spécifique
                if (candidature.getTache() != null) {
                    candidature.getTache().assignerExpert(candidature.getExpertId());
                    tacheRepository.save(candidature.getTache());
                }
                // Note: Pour les candidatures sur le projet entier, l'assignation des tâches
                // est gérée par le frontend qui permet de sélectionner les tâches spécifiques
                break;
            case "REFUSER":
                candidature.refuser(request.getReponse());
                break;
            case "EN_DISCUSSION":
                candidature.setStatut(CandidatureProjet.StatutCandidature.EN_DISCUSSION);
                candidature.setReponseClient(request.getReponse());
                candidature.setDateReponse(LocalDateTime.now());
                break;
            default:
                throw new IllegalArgumentException("Action invalide: " + action);
        }

        candidature.setDateModification(LocalDateTime.now());
        candidature = candidatureRepository.save(candidature);

        log.info("Candidature {} mise à jour: statut={}", candidatureId, candidature.getStatut());
        return new CandidatureProjetDTO(candidature);
    }

    /**
     * Retirer une candidature (par l'expert).
     */
    public void retirerCandidature(Long candidatureId, String expertId) {
        log.info("Retrait de la candidature {} par l'expert {}", candidatureId, expertId);

        CandidatureProjet candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée: " + candidatureId));

        // Vérifier que l'utilisateur est l'expert de la candidature
        if (!candidature.getExpertId().equals(UUID.fromString(expertId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à retirer cette candidature");
        }

        // Vérifier que la candidature peut être retirée
        if (candidature.getStatut() == CandidatureProjet.StatutCandidature.ACCEPTEE) {
            throw new IllegalStateException("Une candidature acceptée ne peut pas être retirée");
        }

        candidature.retirer();
        candidature.setDateModification(LocalDateTime.now());
        candidatureRepository.save(candidature);

        log.info("Candidature {} retirée avec succès", candidatureId);
    }

    /**
     * Obtenir une candidature par son ID.
     */
    @Transactional(readOnly = true)
    public CandidatureProjetDTO obtenirCandidature(Long candidatureId) {
        CandidatureProjet candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée: " + candidatureId));
        return new CandidatureProjetDTO(candidature);
    }

    /**
     * Lister les candidatures d'un expert.
     */
    @Transactional(readOnly = true)
    public List<CandidatureProjetDTO> listerMesCandidatures(String expertId) {
        return candidatureRepository.findByExpertIdOrderByDateCreationDesc(UUID.fromString(expertId))
                .stream()
                .map(CandidatureProjetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lister les candidatures d'un expert avec pagination.
     */
    @Transactional(readOnly = true)
    public Page<CandidatureProjetDTO> listerMesCandidatures(String expertId, Pageable pageable) {
        return candidatureRepository.findByExpertId(UUID.fromString(expertId), pageable)
                .map(CandidatureProjetDTO::new);
    }

    /**
     * Lister les candidatures sur un projet.
     */
    @Transactional(readOnly = true)
    public List<CandidatureProjetDTO> listerCandidaturesProjet(Long projetId, String proprietaireId) {
        // Vérifier que l'utilisateur est le propriétaire
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));

        if (!projet.getProprietaireId().equals(UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à voir ces candidatures");
        }

        return candidatureRepository.findByProjetIdOrderByDateCreationDesc(projetId)
                .stream()
                .map(this::convertirEtEnrichir)
                .collect(Collectors.toList());
    }

    /**
     * Lister les candidatures sur une tâche.
     */
    @Transactional(readOnly = true)
    public List<CandidatureProjetDTO> listerCandidaturesTache(Long tacheId, String proprietaireId) {
        TacheProjet tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée: " + tacheId));

        if (!tache.getProjet().getProprietaireId().equals(UUID.fromString(proprietaireId))) {
            throw new RuntimeException("Vous n'êtes pas autorisé à voir ces candidatures");
        }

        return candidatureRepository.findByTacheIdOrderByDateCreationDesc(tacheId)
                .stream()
                .map(CandidatureProjetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lister les candidatures en attente pour un propriétaire.
     */
    @Transactional(readOnly = true)
    public List<CandidatureProjetDTO> listerCandidaturesEnAttente(String proprietaireId) {
        return candidatureRepository.findCandidaturesEnAttenteParProprietaire(UUID.fromString(proprietaireId))
                .stream()
                .map(CandidatureProjetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Compter les candidatures en attente pour un propriétaire.
     */
    @Transactional(readOnly = true)
    public long compterCandidaturesEnAttente(String proprietaireId) {
        return candidatureRepository.findCandidaturesEnAttenteParProprietaire(UUID.fromString(proprietaireId)).size();
    }

    /**
     * Compter les candidatures d'un expert par statut.
     */
    @Transactional(readOnly = true)
    public long compterMesCandidaturesParStatut(String expertId, String statut) {
        CandidatureProjet.StatutCandidature statutEnum = CandidatureProjet.StatutCandidature.valueOf(statut);
        return candidatureRepository.countByExpertIdAndStatut(UUID.fromString(expertId), statutEnum);
    }

    /**
     * Enrichir une candidature avec les infos de l'expert.
     */
    private CandidatureProjetDTO enrichirAvecInfosExpert(CandidatureProjetDTO dto) {
        if (dto.getExpertId() == null) return dto;

        try {
            // Récupérer l'expertise de l'utilisateur (photoUrl et titre)
            expertiseRepository.findByUtilisateurId(dto.getExpertId()).ifPresent(expertise -> {
                dto.setExpertPhotoUrl(expertise.getPhotoUrl());
                dto.setExpertTitre(expertise.getTitre());
            });

            // Récupérer nom/prénom depuis le service Auth
            if (restTemplate != null) {
                try {
                    String authServiceUrl = "http://auth/api/utilisateurs/" + dto.getExpertId();
                    ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        authServiceUrl,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                    );

                    if (response.getBody() != null) {
                        Map<String, Object> userMap = response.getBody();
                        dto.setExpertNom((String) userMap.get("nom"));
                        dto.setExpertPrenom((String) userMap.get("prenom"));
                    }
                } catch (Exception e) {
                    log.warn("Impossible de récupérer les infos de l'expert {}: {}", dto.getExpertId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Erreur lors de l'enrichissement de la candidature: {}", e.getMessage());
        }

        return dto;
    }

    /**
     * Convertir et enrichir une candidature.
     */
    private CandidatureProjetDTO convertirEtEnrichir(CandidatureProjet candidature) {
        return enrichirAvecInfosExpert(new CandidatureProjetDTO(candidature));
    }
}
