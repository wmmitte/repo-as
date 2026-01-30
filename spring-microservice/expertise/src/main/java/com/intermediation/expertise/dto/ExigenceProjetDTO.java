package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.ExigenceProjet;

/**
 * DTO pour une exigence de projet.
 */
public class ExigenceProjetDTO {

    private Long id;
    private Long projetId;
    private String description;
    private String categorie;
    private String priorite;
    private Integer ordre;

    // Constructeurs
    public ExigenceProjetDTO() {}

    public ExigenceProjetDTO(ExigenceProjet exigence) {
        this.id = exigence.getId();
        this.projetId = exigence.getProjet() != null ? exigence.getProjet().getId() : null;
        this.description = exigence.getDescription();
        this.categorie = exigence.getCategorie();
        this.priorite = exigence.getPriorite() != null ? exigence.getPriorite().name() : null;
        this.ordre = exigence.getOrdre();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getPriorite() {
        return priorite;
    }

    public void setPriorite(String priorite) {
        this.priorite = priorite;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }
}
