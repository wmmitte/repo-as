package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request pour créer une tâche de projet.
 */
public class CreerTacheRequest {

    @NotNull(message = "L'ID du projet est obligatoire")
    private Long projetId;

    private Long etapeId; // Nullable - si null, tâche indépendante

    @NotBlank(message = "Le nom de la tâche est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    private String description;

    private Integer ordre;

    private BigDecimal budget;

    private Integer delaiJours;

    private String visibilite = "HERITEE"; // HERITEE, PRIVE, PUBLIC

    private String priorite = "NORMALE"; // BASSE, NORMALE, HAUTE, URGENTE

    private LocalDate dateDebutPrevue;

    private LocalDate dateFinPrevue;

    // Compétences requises (optionnel)
    private List<CompetenceRequiseRequest> competencesRequises;

    // Livrables attendus (optionnel)
    private List<LivrableRequest> livrables;

    // Constructeurs
    public CreerTacheRequest() {}

    // Getters et Setters
    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

    public Long getEtapeId() {
        return etapeId;
    }

    public void setEtapeId(Long etapeId) {
        this.etapeId = etapeId;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public Integer getDelaiJours() {
        return delaiJours;
    }

    public void setDelaiJours(Integer delaiJours) {
        this.delaiJours = delaiJours;
    }

    public String getVisibilite() {
        return visibilite;
    }

    public void setVisibilite(String visibilite) {
        this.visibilite = visibilite;
    }

    public String getPriorite() {
        return priorite;
    }

    public void setPriorite(String priorite) {
        this.priorite = priorite;
    }

    public LocalDate getDateDebutPrevue() {
        return dateDebutPrevue;
    }

    public void setDateDebutPrevue(LocalDate dateDebutPrevue) {
        this.dateDebutPrevue = dateDebutPrevue;
    }

    public LocalDate getDateFinPrevue() {
        return dateFinPrevue;
    }

    public void setDateFinPrevue(LocalDate dateFinPrevue) {
        this.dateFinPrevue = dateFinPrevue;
    }

    public List<CompetenceRequiseRequest> getCompetencesRequises() {
        return competencesRequises;
    }

    public void setCompetencesRequises(List<CompetenceRequiseRequest> competencesRequises) {
        this.competencesRequises = competencesRequises;
    }

    public List<LivrableRequest> getLivrables() {
        return livrables;
    }

    public void setLivrables(List<LivrableRequest> livrables) {
        this.livrables = livrables;
    }

    /**
     * Inner class pour les compétences requises.
     */
    public static class CompetenceRequiseRequest {
        private Long competenceReferenceId;
        private Integer niveauRequis;
        private Boolean estObligatoire = true;

        public Long getCompetenceReferenceId() {
            return competenceReferenceId;
        }

        public void setCompetenceReferenceId(Long competenceReferenceId) {
            this.competenceReferenceId = competenceReferenceId;
        }

        public Integer getNiveauRequis() {
            return niveauRequis;
        }

        public void setNiveauRequis(Integer niveauRequis) {
            this.niveauRequis = niveauRequis;
        }

        public Boolean getEstObligatoire() {
            return estObligatoire;
        }

        public void setEstObligatoire(Boolean estObligatoire) {
            this.estObligatoire = estObligatoire;
        }
    }

    /**
     * Inner class pour les livrables.
     */
    public static class LivrableRequest {
        private String nom;
        private String description;
        private List<String> criteresAcceptation;

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getCriteresAcceptation() {
            return criteresAcceptation;
        }

        public void setCriteresAcceptation(List<String> criteresAcceptation) {
            this.criteresAcceptation = criteresAcceptation;
        }
    }
}
