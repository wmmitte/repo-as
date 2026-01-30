package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request pour valider un livrable (accepter ou refuser).
 */
public class ValiderLivrableRequest {

    @NotNull(message = "L'action est obligatoire")
    private Boolean accepte;

    private String commentaire;

    // Validation des critères individuels (optionnel)
    private List<CritereValidation> criteresValidation;

    // Constructeurs
    public ValiderLivrableRequest() {}

    // Getters et Setters
    public Boolean getAccepte() {
        return accepte;
    }

    public void setAccepte(Boolean accepte) {
        this.accepte = accepte;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public List<CritereValidation> getCriteresValidation() {
        return criteresValidation;
    }

    public void setCriteresValidation(List<CritereValidation> criteresValidation) {
        this.criteresValidation = criteresValidation;
    }

    /**
     * Inner class pour la validation des critères.
     */
    public static class CritereValidation {
        private Long critereId;
        private Boolean estSatisfait;

        public Long getCritereId() {
            return critereId;
        }

        public void setCritereId(Long critereId) {
            this.critereId = critereId;
        }

        public Boolean getEstSatisfait() {
            return estSatisfait;
        }

        public void setEstSatisfait(Boolean estSatisfait) {
            this.estSatisfait = estSatisfait;
        }
    }
}
