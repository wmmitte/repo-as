package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.TacheCompetenceRequise;

/**
 * DTO pour une compétence requise pour une tâche.
 */
public class CompetenceRequiseDTO {

    private Long id;
    private Long tacheId;
    private Long competenceReferenceId;
    private String competenceCode;
    private String competenceLibelle;
    private Integer niveauRequis;
    private Boolean estObligatoire;

    // Constructeurs
    public CompetenceRequiseDTO() {}

    public CompetenceRequiseDTO(TacheCompetenceRequise competenceRequise) {
        this.id = competenceRequise.getId();
        this.tacheId = competenceRequise.getTache() != null ? competenceRequise.getTache().getId() : null;
        this.competenceReferenceId = competenceRequise.getCompetenceReference() != null ?
                competenceRequise.getCompetenceReference().getId() : null;
        this.competenceCode = competenceRequise.getCompetenceReference() != null ?
                competenceRequise.getCompetenceReference().getCode() : null;
        this.competenceLibelle = competenceRequise.getCompetenceReference() != null ?
                competenceRequise.getCompetenceReference().getLibelle() : null;
        this.niveauRequis = competenceRequise.getNiveauRequis();
        this.estObligatoire = competenceRequise.getEstObligatoire();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTacheId() {
        return tacheId;
    }

    public void setTacheId(Long tacheId) {
        this.tacheId = tacheId;
    }

    public Long getCompetenceReferenceId() {
        return competenceReferenceId;
    }

    public void setCompetenceReferenceId(Long competenceReferenceId) {
        this.competenceReferenceId = competenceReferenceId;
    }

    public String getCompetenceCode() {
        return competenceCode;
    }

    public void setCompetenceCode(String competenceCode) {
        this.competenceCode = competenceCode;
    }

    public String getCompetenceLibelle() {
        return competenceLibelle;
    }

    public void setCompetenceLibelle(String competenceLibelle) {
        this.competenceLibelle = competenceLibelle;
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
