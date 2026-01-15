package com.intermediation.expertise.dto;

import java.util.List;

/**
 * DTO complet regroupant toutes les expertises d'un utilisateur
 * Inclut le profil d'expertise général + la liste des compétences techniques
 */
public class ExpertiseCompletDTO {
    
    private ExpertiseDTO expertise;
    private List<CompetenceDTO> competences;

    // Constructeurs
    public ExpertiseCompletDTO() {}

    public ExpertiseCompletDTO(ExpertiseDTO expertise, List<CompetenceDTO> competences) {
        this.expertise = expertise;
        this.competences = competences;
    }

    // Constructeur de compatibilité (pour ne retourner que les compétences)
    public ExpertiseCompletDTO(List<CompetenceDTO> competences) {
        this.competences = competences;
    }

    // Getters et Setters
    public ExpertiseDTO getExpertise() {
        return expertise;
    }

    public void setExpertise(ExpertiseDTO expertise) {
        this.expertise = expertise;
    }

    public List<CompetenceDTO> getCompetences() {
        return competences;
    }

    public void setCompetences(List<CompetenceDTO> competences) {
        this.competences = competences;
    }
}
