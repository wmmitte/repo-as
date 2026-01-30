package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.CritereAcceptationLivrable;

import java.time.LocalDateTime;

/**
 * DTO pour un critère d'acceptation de livrable.
 */
public class CritereAcceptationDTO {

    private Long id;
    private Long livrableId;
    private String description;
    private Integer ordre;
    private Boolean estValide;
    private String commentaire;
    private LocalDateTime dateValidation;

    // Constructeurs
    public CritereAcceptationDTO() {}

    public CritereAcceptationDTO(CritereAcceptationLivrable critere) {
        this.id = critere.getId();
        this.livrableId = critere.getLivrable() != null ? critere.getLivrable().getId() : null;
        this.description = critere.getDescription();
        this.ordre = critere.getOrdre();
        this.estValide = critere.getEstValide();
        this.commentaire = critere.getCommentaire();
        this.dateValidation = critere.getDateValidation();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLivrableId() {
        return livrableId;
    }

    public void setLivrableId(Long livrableId) {
        this.livrableId = livrableId;
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

    public Boolean getEstValide() {
        return estValide;
    }

    public void setEstValide(Boolean estValide) {
        this.estValide = estValide;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public void setDateValidation(LocalDateTime dateValidation) {
        this.dateValidation = dateValidation;
    }
}
