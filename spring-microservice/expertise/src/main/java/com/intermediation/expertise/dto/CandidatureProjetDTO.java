package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.CandidatureProjet;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO pour une candidature sur un projet ou une tâche.
 */
public class CandidatureProjetDTO {

    private Long id;
    private Long projetId;
    private String projetNom;
    private Long tacheId;
    private String tacheNom;
    private String expertId;
    private String message;
    private BigDecimal tarifPropose;
    private Integer delaiProposeJours;
    private String statut;
    private String reponseClient;
    private LocalDateTime dateReponse;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Indicateur
    private Boolean estSurTache;

    // Constructeurs
    public CandidatureProjetDTO() {}

    public CandidatureProjetDTO(CandidatureProjet candidature) {
        this.id = candidature.getId();
        this.projetId = candidature.getProjet() != null ? candidature.getProjet().getId() : null;
        this.projetNom = candidature.getProjet() != null ? candidature.getProjet().getNom() : null;
        this.tacheId = candidature.getTache() != null ? candidature.getTache().getId() : null;
        this.tacheNom = candidature.getTache() != null ? candidature.getTache().getNom() : null;
        this.expertId = candidature.getExpertId() != null ? candidature.getExpertId().toString() : null;
        this.message = candidature.getMessage();
        this.tarifPropose = candidature.getTarifPropose();
        this.delaiProposeJours = candidature.getDelaiProposeJours();
        this.statut = candidature.getStatut() != null ? candidature.getStatut().name() : null;
        this.reponseClient = candidature.getReponseClient();
        this.dateReponse = candidature.getDateReponse();
        this.dateCreation = candidature.getDateCreation();
        this.dateModification = candidature.getDateModification();
        this.estSurTache = candidature.estSurTache();
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

    public String getProjetNom() {
        return projetNom;
    }

    public void setProjetNom(String projetNom) {
        this.projetNom = projetNom;
    }

    public Long getTacheId() {
        return tacheId;
    }

    public void setTacheId(Long tacheId) {
        this.tacheId = tacheId;
    }

    public String getTacheNom() {
        return tacheNom;
    }

    public void setTacheNom(String tacheNom) {
        this.tacheNom = tacheNom;
    }

    public String getExpertId() {
        return expertId;
    }

    public void setExpertId(String expertId) {
        this.expertId = expertId;
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getReponseClient() {
        return reponseClient;
    }

    public void setReponseClient(String reponseClient) {
        this.reponseClient = reponseClient;
    }

    public LocalDateTime getDateReponse() {
        return dateReponse;
    }

    public void setDateReponse(LocalDateTime dateReponse) {
        this.dateReponse = dateReponse;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public Boolean getEstSurTache() {
        return estSurTache;
    }

    public void setEstSurTache(Boolean estSurTache) {
        this.estSurTache = estSurTache;
    }
}
