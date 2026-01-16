package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.CreerDemandeContactRequest;
import com.intermediation.expertise.dto.DemandeContactDTO;
import com.intermediation.expertise.model.DemandeContact;
import com.intermediation.expertise.model.DemandeContact.StatutDemande;
import com.intermediation.expertise.repository.DemandeContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des demandes de contact
 */
@Service
public class DemandeContactService {

    private static final Logger logger = LoggerFactory.getLogger(DemandeContactService.class);

    private final DemandeContactRepository demandeContactRepository;
    private final RestTemplate restTemplate;

    public DemandeContactService(DemandeContactRepository demandeContactRepository, RestTemplate restTemplate) {
        this.demandeContactRepository = demandeContactRepository;
        this.restTemplate = restTemplate;
        logger.info("DemandeContactService initialisé avec RestTemplate: {}", restTemplate != null ? "OK" : "NULL");
    }

    /**
     * Créer une nouvelle demande de contact
     */
    @Transactional
    public DemandeContactDTO creerDemandeContact(String expediteurId, String destinataireId, CreerDemandeContactRequest request) {
        logger.info("Création d'une demande de contact de {} vers {}", expediteurId, destinataireId);

        // Vérifier que l'expéditeur ne s'envoie pas un message à lui-même
        if (expediteurId.equals(destinataireId)) {
            throw new IllegalArgumentException("Vous ne pouvez pas vous envoyer un message à vous-même");
        }

        DemandeContact demande = new DemandeContact();
        demande.setExpediteurId(expediteurId);
        demande.setDestinataireId(destinataireId);
        demande.setObjet(request.getObjet());
        demande.setMessage(request.getMessage());
        demande.setEmailReponse(request.getEmailReponse());
        demande.setStatut(StatutDemande.EN_ATTENTE);

        demande = demandeContactRepository.save(demande);
        logger.info("Demande de contact créée avec l'ID {}", demande.getId());

        // TODO: Envoyer une notification par email au destinataire
        // emailService.envoyerNotificationContact(destinataireId, expediteurId, demande.getObjet());

        return new DemandeContactDTO(demande);
    }

    /**
     * Récupérer les demandes envoyées par un utilisateur
     */
    public List<DemandeContactDTO> getDemandesEnvoyees(String utilisateurId) {
        List<DemandeContactDTO> demandes = demandeContactRepository.findByExpediteurIdOrderByDateCreationDesc(utilisateurId)
                .stream()
                .map(DemandeContactDTO::new)
                .collect(Collectors.toList());
        return enrichirAvecNomsUtilisateurs(demandes);
    }

    /**
     * Récupérer les demandes reçues par un utilisateur
     */
    public List<DemandeContactDTO> getDemandesRecues(String utilisateurId) {
        List<DemandeContactDTO> demandes = demandeContactRepository.findByDestinataireIdOrderByDateCreationDesc(utilisateurId)
                .stream()
                .map(DemandeContactDTO::new)
                .collect(Collectors.toList());
        return enrichirAvecNomsUtilisateurs(demandes);
    }

    /**
     * Récupérer les demandes non lues
     */
    public List<DemandeContactDTO> getDemandesNonLues(String utilisateurId) {
        List<DemandeContactDTO> demandes = demandeContactRepository.findByDestinataireIdAndStatutOrderByDateCreationDesc(utilisateurId, StatutDemande.EN_ATTENTE)
                .stream()
                .map(DemandeContactDTO::new)
                .collect(Collectors.toList());
        return enrichirAvecNomsUtilisateurs(demandes);
    }

    /**
     * Enrichir les DTOs avec les noms des expéditeurs et destinataires
     */
    private List<DemandeContactDTO> enrichirAvecNomsUtilisateurs(List<DemandeContactDTO> demandes) {
        if (demandes.isEmpty()) {
            logger.debug("Liste de demandes vide, pas d'enrichissement nécessaire");
            return demandes;
        }

        if (restTemplate == null) {
            logger.warn("RestTemplate est null, impossible d'enrichir les demandes avec les noms");
            return demandes;
        }

        // Collecter tous les IDs uniques
        Set<String> userIds = demandes.stream()
                .flatMap(d -> java.util.stream.Stream.of(d.getExpediteurId(), d.getDestinataireId()))
                .collect(Collectors.toSet());

        logger.info("Enrichissement de {} demandes avec les informations de {} utilisateurs", demandes.size(), userIds.size());

        // Récupérer les informations utilisateurs depuis le service Auth
        Map<String, Map<String, Object>> utilisateursMap = new HashMap<>();
        for (String userId : userIds) {
            Map<String, Object> userInfo = getUtilisateurPublic(userId);
            if (userInfo != null) {
                utilisateursMap.put(userId, userInfo);
                logger.debug("Utilisateur {} récupéré: nom={}, prenom={}",
                    userId, userInfo.get("nom"), userInfo.get("prenom"));
            } else {
                logger.warn("Aucune info trouvée pour l'utilisateur {}", userId);
            }
        }

        logger.info("Infos récupérées pour {} utilisateurs sur {}", utilisateursMap.size(), userIds.size());

        // Enrichir les DTOs
        for (DemandeContactDTO demande : demandes) {
            Map<String, Object> expediteur = utilisateursMap.get(demande.getExpediteurId());
            if (expediteur != null) {
                demande.setExpediteurNom((String) expediteur.get("nom"));
                demande.setExpediteurPrenom((String) expediteur.get("prenom"));
                demande.setExpediteurHasPhoto(Boolean.TRUE.equals(expediteur.get("hasPhoto")));
            }

            Map<String, Object> destinataire = utilisateursMap.get(demande.getDestinataireId());
            if (destinataire != null) {
                demande.setDestinataireNom((String) destinataire.get("nom"));
                demande.setDestinatairePrenom((String) destinataire.get("prenom"));
                demande.setDestinataireHasPhoto(Boolean.TRUE.equals(destinataire.get("hasPhoto")));
            }
        }

        return demandes;
    }

    /**
     * Récupérer les informations publiques d'un utilisateur depuis le service Auth
     */
    private Map<String, Object> getUtilisateurPublic(String utilisateurId) {
        if (utilisateurId == null || utilisateurId.isEmpty()) {
            logger.warn("ID utilisateur null ou vide");
            return null;
        }

        try {
            // Appel vers le service Auth via Eureka
            String authServiceUrl = "http://auth/api/profil/public/" + utilisateurId;
            logger.info("Appel REST vers: {}", authServiceUrl);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                authServiceUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                logger.info("Utilisateur {} récupéré avec succès - nom: {}, prenom: {}",
                    utilisateurId, body.get("nom"), body.get("prenom"));
                return body;
            } else {
                logger.warn("Réponse vide ou erreur pour l'utilisateur {}: status={}",
                    utilisateurId, response.getStatusCode());
            }
        } catch (RestClientException e) {
            logger.error("Erreur REST lors de la récupération de l'utilisateur {}: {}", utilisateurId, e.getMessage());
        } catch (Exception e) {
            logger.error("Erreur inattendue lors de la récupération de l'utilisateur {}: {} - {}",
                utilisateurId, e.getClass().getSimpleName(), e.getMessage());
        }
        return null;
    }

    /**
     * Compter les demandes non lues
     */
    public long compterDemandesNonLues(String utilisateurId) {
        return demandeContactRepository.countByDestinataireIdAndStatut(utilisateurId, StatutDemande.EN_ATTENTE);
    }

    /**
     * Marquer une demande comme lue
     */
    @Transactional
    public DemandeContactDTO marquerCommeLue(Long demandeId, String utilisateurId) {
        DemandeContact demande = demandeContactRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande de contact non trouvée"));

        // Vérifier que l'utilisateur est bien le destinataire
        if (!demande.getDestinataireId().equals(utilisateurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette demande");
        }

        demande.marquerCommeLue();
        demande = demandeContactRepository.save(demande);

        DemandeContactDTO dto = new DemandeContactDTO(demande);
        return enrichirUneDemande(dto);
    }

    /**
     * Récupérer une demande par son ID
     */
    public DemandeContactDTO getDemandeById(Long demandeId, String utilisateurId) {
        DemandeContact demande = demandeContactRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande de contact non trouvée"));

        // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
        if (!demande.getExpediteurId().equals(utilisateurId) && !demande.getDestinataireId().equals(utilisateurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à consulter cette demande");
        }

        DemandeContactDTO dto = new DemandeContactDTO(demande);
        return enrichirUneDemande(dto);
    }

    /**
     * Enrichir une seule demande avec les noms des utilisateurs
     */
    private DemandeContactDTO enrichirUneDemande(DemandeContactDTO demande) {
        if (restTemplate == null) {
            logger.warn("RestTemplate null, impossible d'enrichir la demande {}", demande.getId());
            return demande;
        }

        logger.info("Enrichissement de la demande {} (expediteur: {}, destinataire: {})",
            demande.getId(), demande.getExpediteurId(), demande.getDestinataireId());

        // Enrichir expéditeur
        Map<String, Object> expediteur = getUtilisateurPublic(demande.getExpediteurId());
        if (expediteur != null) {
            demande.setExpediteurNom((String) expediteur.get("nom"));
            demande.setExpediteurPrenom((String) expediteur.get("prenom"));
            demande.setExpediteurHasPhoto(Boolean.TRUE.equals(expediteur.get("hasPhoto")));
            logger.debug("Expéditeur enrichi: {} {}", expediteur.get("prenom"), expediteur.get("nom"));
        } else {
            logger.warn("Impossible d'enrichir l'expéditeur {}", demande.getExpediteurId());
        }

        // Enrichir destinataire
        Map<String, Object> destinataire = getUtilisateurPublic(demande.getDestinataireId());
        if (destinataire != null) {
            demande.setDestinataireNom((String) destinataire.get("nom"));
            demande.setDestinatairePrenom((String) destinataire.get("prenom"));
            demande.setDestinataireHasPhoto(Boolean.TRUE.equals(destinataire.get("hasPhoto")));
            logger.debug("Destinataire enrichi: {} {}", destinataire.get("prenom"), destinataire.get("nom"));
        } else {
            logger.warn("Impossible d'enrichir le destinataire {}", demande.getDestinataireId());
        }

        return demande;
    }

    /**
     * Archiver une demande
     */
    @Transactional
    public void archiverDemande(Long demandeId, String utilisateurId) {
        DemandeContact demande = demandeContactRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande de contact non trouvée"));

        // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
        if (!demande.getExpediteurId().equals(utilisateurId) && !demande.getDestinataireId().equals(utilisateurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à archiver cette demande");
        }

        demande.archiver();
        demandeContactRepository.save(demande);
        logger.info("Demande de contact {} archivée par {}", demandeId, utilisateurId);
    }
}
