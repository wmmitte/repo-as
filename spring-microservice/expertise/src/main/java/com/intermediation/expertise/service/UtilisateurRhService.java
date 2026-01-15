package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.UtilisateurRhDTO;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import com.intermediation.expertise.repository.DemandeReconnaissanceRepository;
import com.intermediation.expertise.repository.EvaluationCompetenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour gérer les utilisateurs RH
 */
@Service
public class UtilisateurRhService {

    private static final Logger logger = LoggerFactory.getLogger(UtilisateurRhService.class);

    @Autowired
    private DemandeReconnaissanceRepository demandeRepository;

    @Autowired
    private EvaluationCompetenceRepository evaluationRepository;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    /**
     * Récupérer la liste des utilisateurs RH avec leurs statistiques
     */
    public List<UtilisateurRhDTO> getUtilisateursRhDisponibles() {
        List<UtilisateurRhDTO> utilisateursRh = new ArrayList<>();

        try {
            // Récupérer les utilisateurs RH depuis le service Auth
            utilisateursRh = getUtilisateursRhFromAuthService();

            // Enrichir avec les statistiques
            for (UtilisateurRhDTO rh : utilisateursRh) {
                enrichirAvecStatistiques(rh);
            }

            logger.info("Récupération de {} utilisateurs RH depuis le service Auth", utilisateursRh.size());

        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des utilisateurs RH depuis le service Auth: {}", e.getMessage());
            logger.warn("La liste des utilisateurs RH sera vide. Veuillez vérifier que le service Auth est disponible et qu'il existe des utilisateurs avec le rôle RH dans Keycloak.");
            // Retourner une liste vide en cas d'erreur
        }

        return utilisateursRh;
    }

    /**
     * Récupérer les informations d'un utilisateur RH par son ID
     */
    public UtilisateurRhDTO getUtilisateurRhParId(String rhId) {
        if (restTemplate == null) {
            logger.error("RestTemplate non configuré - impossible de récupérer l'utilisateur RH");
            return null;
        }

        try {
            String authServiceUrl = "http://auth/api/utilisateurs/" + rhId;
            logger.debug("Appel au service Auth pour récupérer l'utilisateur RH {}: {}", rhId, authServiceUrl);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                authServiceUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getBody() != null) {
                Map<String, Object> userMap = response.getBody();
                String userId = String.valueOf(userMap.get("id"));
                String email = (String) userMap.get("email");
                String nom = (String) userMap.getOrDefault("nom",
                              userMap.getOrDefault("prenom", email));

                // Si nom et prenom existent séparément
                if (userMap.containsKey("prenom") && userMap.containsKey("nom")) {
                    nom = userMap.get("prenom") + " " + userMap.get("nom");
                }

                UtilisateurRhDTO rh = new UtilisateurRhDTO(userId, email);
                rh.setNom(nom);
                return rh;
            }
        } catch (Exception e) {
            logger.warn("Impossible de récupérer l'utilisateur RH {} depuis le service Auth: {}", rhId, e.getMessage());
        }

        return null;
    }

    /**
     * Enrichir un utilisateur RH avec ses statistiques de traitement
     */
    private void enrichirAvecStatistiques(UtilisateurRhDTO rh) {
        String rhId = rh.getUserId();

        // Nombre de demandes en cours (assignées à ce RH)
        List<StatutDemande> statutsEnCours = List.of(
            StatutDemande.ASSIGNEE_RH,
            StatutDemande.EN_COURS_EVALUATION
        );
        long nombreEnCours = demandeRepository.countByTraitantIdAndStatutIn(rhId, statutsEnCours);
        rh.setNombreDemandesEnCours(nombreEnCours);

        // Nombre de demandes traitées (approuvées + rejetées)
        long approuvees = demandeRepository.countByTraitantIdAndStatut(rhId, StatutDemande.APPROUVEE);
        long rejetees = demandeRepository.countByTraitantIdAndStatut(rhId, StatutDemande.REJETEE);
        long totalTraitees = approuvees + rejetees;
        rh.setNombreDemandesTraitees(totalTraitees);

        // Taux d'approbation
        if (totalTraitees > 0) {
            double tauxApprobation = (double) approuvees / totalTraitees * 100.0;
            rh.setTauxApprobation(Math.round(tauxApprobation * 10.0) / 10.0);
        } else {
            rh.setTauxApprobation(0.0);
        }

        // Note moyenne des évaluations
        Double noteMoyenne = evaluationRepository.getMoyenneNotesByTraitant(rhId);
        rh.setNoteMoyenne(noteMoyenne != null ? Math.round(noteMoyenne * 10.0) / 10.0 : 0.0);
    }

    /**
     * Appeler le service Auth pour récupérer les utilisateurs RH
     */
    private List<UtilisateurRhDTO> getUtilisateursRhFromAuthService() {
        if (restTemplate == null) {
            logger.error("RestTemplate non configuré - impossible de récupérer les utilisateurs RH");
            throw new RuntimeException("RestTemplate non configuré");
        }

        // Utiliser Eureka pour découvrir le service AUTH
        // Le nom du service en majuscule est résolu par Eureka + Ribbon
        String authServiceUrl = "http://auth/api/utilisateurs/role/RH";

        logger.info("Appel au service Auth pour récupérer les utilisateurs RH: {}", authServiceUrl);

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
            authServiceUrl,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        if (response.getBody() != null && !response.getBody().isEmpty()) {
            List<UtilisateurRhDTO> utilisateurs = response.getBody().stream()
                .map(userMap -> {
                    // Adapter selon la structure réelle des données du service Auth
                    String userId = String.valueOf(userMap.get("id"));
                    String email = (String) userMap.get("email");
                    String nom = (String) userMap.getOrDefault("nom",
                                  userMap.getOrDefault("prenom", email));

                    // Si nom et prenom existent séparément
                    if (userMap.containsKey("prenom") && userMap.containsKey("nom")) {
                        nom = userMap.get("prenom") + " " + userMap.get("nom");
                    }

                    UtilisateurRhDTO rh = new UtilisateurRhDTO(userId, email);
                    rh.setNom(nom);
                    return rh;
                })
                .collect(Collectors.toList());

            logger.info("✅ {} utilisateurs RH récupérés depuis le service Auth", utilisateurs.size());
            return utilisateurs;
        } else {
            logger.warn("Aucun utilisateur RH trouvé dans le service Auth");
            return new ArrayList<>();
        }
    }
}
