package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request pour répondre à une candidature (accepter ou refuser).
 */
public class RepondreCandidatureRequest {

    @NotNull(message = "L'action est obligatoire (ACCEPTER ou REFUSER)")
    private String action; // ACCEPTER, REFUSER, EN_DISCUSSION

    private String reponse;

    // Constructeurs
    public RepondreCandidatureRequest() {}

    // Getters et Setters
    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReponse() {
        return reponse;
    }

    public void setReponse(String reponse) {
        this.reponse = reponse;
    }
}
