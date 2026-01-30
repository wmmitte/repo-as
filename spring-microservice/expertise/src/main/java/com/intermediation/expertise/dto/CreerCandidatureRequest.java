package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Request pour créer une candidature sur un projet ou une tâche.
 */
public class CreerCandidatureRequest {

    @NotNull(message = "L'ID du projet est obligatoire")
    private Long projetId;

    private Long tacheId; // Nullable - si null, candidature sur le projet entier

    private String message;

    private BigDecimal tarifPropose;

    private Integer delaiProposeJours;

    // Constructeurs
    public CreerCandidatureRequest() {}

    // Getters et Setters
    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

    public Long getTacheId() {
        return tacheId;
    }

    public void setTacheId(Long tacheId) {
        this.tacheId = tacheId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getTarifPropose() {
        return tarifPropose;
    }

    public void setTarifPropose(BigDecimal tarifPropose) {
        this.tarifPropose = tarifPropose;
    }

    public Integer getDelaiProposeJours() {
        return delaiProposeJours;
    }

    public void setDelaiProposeJours(Integer delaiProposeJours) {
        this.delaiProposeJours = delaiProposeJours;
    }
}
