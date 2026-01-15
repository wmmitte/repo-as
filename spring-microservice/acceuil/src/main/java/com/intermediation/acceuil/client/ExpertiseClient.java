package com.intermediation.acceuil.client;

import com.intermediation.acceuil.model.Expert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Client pour appeler le service Expertise et récupérer les experts publiés
 */
@Component
public class ExpertiseClient {
    
    private static final Logger log = LoggerFactory.getLogger(ExpertiseClient.class);
    
    private final RestTemplate restTemplate;
    private final String expertiseServiceUrl;
    private final String authServiceUrl;
    
    public ExpertiseClient(
            RestTemplate restTemplate,
            @Value("${expertise.service.url:http://localhost:8086}") String expertiseServiceUrl,
            @Value("${auth.service.url:http://localhost:8084}") String authServiceUrl) {
        this.restTemplate = restTemplate;
        this.expertiseServiceUrl = expertiseServiceUrl;
        this.authServiceUrl = authServiceUrl;
    }
    
    /**
     * Récupère tous les experts publiés depuis le service Expertise
     */
    public List<Expert> getExpertsPublies() {
        try {
            String url = expertiseServiceUrl + "/api/expertise/public/experts";
            log.info("Appel au service expertise: {}", url);
            
            ResponseEntity<List<ExpertPublicDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ExpertPublicDTO>>() {}
            );
            
            List<ExpertPublicDTO> expertsDTO = response.getBody();
            if (expertsDTO == null || expertsDTO.isEmpty()) {
                log.warn("Aucun expert publié trouvé");
                return new ArrayList<>();
            }
            
            log.info("Récupération de {} experts publiés", expertsDTO.size());
            
            // Convertir les DTOs en modèle Expert
            return expertsDTO.stream()
                    .map(this::convertToExpert)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des experts: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Convertit un ExpertPublicDTO en Expert
     */
    private Expert convertToExpert(ExpertPublicDTO dto) {
        Expert expert = new Expert();
        expert.setId(dto.getUtilisateurId());
        expert.setTitre(dto.getTitre());
        expert.setDescription(dto.getDescription());
        expert.setPhotoUrl(dto.getPhotoUrl());
        expert.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : false);
        
        // Récupérer nom/prénom depuis le service Auth
        try {
            String authUrl = authServiceUrl + "/api/profil/public/" + dto.getUtilisateurId();
            UtilisateurPublicDTO utilisateur = restTemplate.getForObject(authUrl, UtilisateurPublicDTO.class);
            
            if (utilisateur != null) {
                if ("MORALE".equals(utilisateur.getTypePersonne())) {
                    // Personne morale : afficher uniquement le nom (nom de l'organisation)
                    expert.setNom(utilisateur.getNom() != null ? utilisateur.getNom() : "");
                    expert.setPrenom("");
                } else {
                    // Personne physique : afficher nom et prénom
                    expert.setNom(utilisateur.getNom() != null ? utilisateur.getNom() : "");
                    expert.setPrenom(utilisateur.getPrenom() != null ? utilisateur.getPrenom() : "");
                }
            } else {
                expert.setNom("");
                expert.setPrenom("");
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos utilisateur pour {}: {}", dto.getUtilisateurId(), e.getMessage());
            expert.setNom("");
            expert.setPrenom("");
        }
        
        // Localisation
        if (dto.getLocalisation() != null) {
            expert.setLocalisation(dto.getLocalisation());
        }
        
        // Convertir les compétences
        if (dto.getCompetences() != null) {
            List<Expert.Competence> competences = dto.getCompetences().stream()
                    .map(compDto -> {
                        Expert.Competence comp = new Expert.Competence();
                        comp.setNom(compDto.getNom());
                        comp.setFavorite(compDto.getEstFavorite() != null ? compDto.getEstFavorite() : false);
                        comp.setAnneesExperience(compDto.getAnneesExperience());
                        comp.setThm(compDto.getThm());
                        comp.setNombreProjets(compDto.getNombreProjets());
                        comp.setCertifications(compDto.getCertifications());
                        comp.setNiveauMaitrise(compDto.getNiveauMaitrise());
                        return comp;
                    })
                    .collect(Collectors.toList());
            expert.setCompetences(competences);
            
            // Calculer les valeurs agrégées à partir des compétences
            calculateAggregatedValues(expert, competences);
        }
        
        // Valeurs par défaut
        expert.setRating(4.5); // TODO: Implémenter un système de notation réel
        
        return expert;
    }
    
    /**
     * Calcule les valeurs agrégées à partir des compétences
     */
    private void calculateAggregatedValues(Expert expert, List<Expert.Competence> competences) {
        if (competences.isEmpty()) {
            expert.setExperienceAnnees(0);
            expert.setTjmMin(0);
            expert.setTjmMax(0);
            expert.setNombreProjets(0);
            return;
        }
        
        // Années d'expérience: maximum parmi toutes les compétences
        expert.setExperienceAnnees(
            competences.stream()
                .filter(c -> c.getAnneesExperience() != null)
                .mapToInt(Expert.Competence::getAnneesExperience)
                .max()
                .orElse(0)
        );
        
        // THM min et max
        List<Integer> thms = competences.stream()
                .filter(c -> c.getThm() != null)
                .map(Expert.Competence::getThm)
                .collect(Collectors.toList());
        
        if (!thms.isEmpty()) {
            expert.setTjmMin(thms.stream().min(Integer::compareTo).orElse(0));
            expert.setTjmMax(thms.stream().max(Integer::compareTo).orElse(0));
        } else {
            expert.setTjmMin(0);
            expert.setTjmMax(0);
        }
        
        // Nombre total de projets: somme de tous les projets
        expert.setNombreProjets(
            competences.stream()
                .filter(c -> c.getNombreProjets() != null)
                .mapToInt(Expert.Competence::getNombreProjets)
                .sum()
        );
    }
    
    /**
     * DTO pour recevoir les infos utilisateur du service Auth
     */
    public static class UtilisateurPublicDTO {
        private String id;
        private String nom;
        private String prenom;
        private String photoUrl;
        private String typePersonne;
        
        // Getters et Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        
        public String getTypePersonne() { return typePersonne; }
        public void setTypePersonne(String typePersonne) { this.typePersonne = typePersonne; }
    }
    
    /**
     * DTO pour recevoir les données du service Expertise
     */
    public static class ExpertPublicDTO {
        private String utilisateurId;
        private String titre;
        private String description;
        private String photoUrl;
        private String localisation;
        private Boolean disponible;
        private List<CompetencePublicDTO> competences;
        
        // Getters et Setters
        public String getUtilisateurId() { return utilisateurId; }
        public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }
        
        public String getTitre() { return titre; }
        public void setTitre(String titre) { this.titre = titre; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        
        public String getLocalisation() { return localisation; }
        public void setLocalisation(String localisation) { this.localisation = localisation; }
        
        public Boolean getDisponible() { return disponible; }
        public void setDisponible(Boolean disponible) { this.disponible = disponible; }
        
        public List<CompetencePublicDTO> getCompetences() { return competences; }
        public void setCompetences(List<CompetencePublicDTO> competences) { this.competences = competences; }
    }
    
    public static class CompetencePublicDTO {
        private String nom;
        private String description;
        private Integer niveauMaitrise;
        private Integer anneesExperience;
        private Integer thm;
        private Integer nombreProjets;
        private String certifications;
        private Boolean estFavorite;
        
        // Getters et Setters
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getNiveauMaitrise() { return niveauMaitrise; }
        public void setNiveauMaitrise(Integer niveauMaitrise) { this.niveauMaitrise = niveauMaitrise; }
        
        public Integer getAnneesExperience() { return anneesExperience; }
        public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }
        
        public Integer getThm() { return thm; }
        public void setThm(Integer thm) { this.thm = thm; }
        
        public Integer getNombreProjets() { return nombreProjets; }
        public void setNombreProjets(Integer nombreProjets) { this.nombreProjets = nombreProjets; }
        
        public String getCertifications() { return certifications; }
        public void setCertifications(String certifications) { this.certifications = certifications; }
        
        public Boolean getEstFavorite() { return estFavorite; }
        public void setEstFavorite(Boolean estFavorite) { this.estFavorite = estFavorite; }
    }
}
