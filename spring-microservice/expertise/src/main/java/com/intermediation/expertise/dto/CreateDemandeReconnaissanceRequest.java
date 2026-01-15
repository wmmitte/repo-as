package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO pour la création d'une demande de reconnaissance de compétence
 */
public class CreateDemandeReconnaissanceRequest {

    @NotNull(message = "L'ID de la compétence est obligatoire")
    private Long competenceId;

    private String commentaire;

    // Constructeurs
    public CreateDemandeReconnaissanceRequest() {}

    public CreateDemandeReconnaissanceRequest(Long competenceId, String commentaire) {
        this.competenceId = competenceId;
        this.commentaire = commentaire;
    }

    // Getters et Setters
    public Long getCompetenceId() {
        return competenceId;
    }

    public void setCompetenceId(Long competenceId) {
        this.competenceId = competenceId;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
