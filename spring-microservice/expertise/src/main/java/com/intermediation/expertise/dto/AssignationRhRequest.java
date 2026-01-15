package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Requête pour assigner une demande à un RH
 */
public class AssignationRhRequest {

    @NotBlank(message = "L'ID du RH est obligatoire")
    private String rhId;

    private String commentaire;

    public AssignationRhRequest() {
    }

    public AssignationRhRequest(String rhId, String commentaire) {
        this.rhId = rhId;
        this.commentaire = commentaire;
    }

    // Getters et Setters

    public String getRhId() {
        return rhId;
    }

    public void setRhId(String rhId) {
        this.rhId = rhId;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
