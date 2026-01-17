package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.Expertise;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO pour le transfert des données d'expertise
 */
public class ExpertiseDTO {

    private Long id;
    private String utilisateurId;
    private String titre;
    private String description;
    private String photoUrl;
    private Long villeId;
    private String localisationComplete; // "Paris, France"
    private Boolean disponible;
    private Boolean publiee;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private BigDecimal scoreGlobal; // Score de classement (0-100)

    // Constructeurs
    public ExpertiseDTO() {}

    public ExpertiseDTO(Expertise expertise) {
        this.id = expertise.getId();
        this.utilisateurId = expertise.getUtilisateurId();
        this.titre = expertise.getTitre();
        this.description = expertise.getDescription();
        this.photoUrl = expertise.getPhotoUrl();
        if (expertise.getVille() != null) {
            this.villeId = expertise.getVille().getId();
            this.localisationComplete = expertise.getLocalisation();
        }
        this.disponible = expertise.getDisponible();
        this.publiee = expertise.getPubliee();
        this.dateCreation = expertise.getDateCreation();
        this.dateModification = expertise.getDateModification();
        this.scoreGlobal = expertise.getScoreGlobal();
    }


    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Long getVilleId() {
        return villeId;
    }

    public void setVilleId(Long villeId) {
        this.villeId = villeId;
    }

    public String getLocalisationComplete() {
        return localisationComplete;
    }

    public void setLocalisationComplete(String localisationComplete) {
        this.localisationComplete = localisationComplete;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Boolean getPubliee() {
        return publiee;
    }

    public void setPubliee(Boolean publiee) {
        this.publiee = publiee;
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

    public BigDecimal getScoreGlobal() {
        return scoreGlobal;
    }

    public void setScoreGlobal(BigDecimal scoreGlobal) {
        this.scoreGlobal = scoreGlobal;
    }
}
