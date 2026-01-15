package com.intermediation.expertise.dto;

import java.time.LocalDateTime;

/**
 * DTO pour l'approbation d'une demande de reconnaissance
 * Permet de définir la validité du badge à attribuer
 */
public class ApprobationRequest {

    private String commentaire;
    private Boolean validitePermanente = true; // Par défaut permanente
    private LocalDateTime dateExpiration; // Obligatoire si validité limitée

    public ApprobationRequest() {}

    public ApprobationRequest(String commentaire, Boolean validitePermanente, LocalDateTime dateExpiration) {
        this.commentaire = commentaire;
        this.validitePermanente = validitePermanente;
        this.dateExpiration = dateExpiration;
    }

    // Validation métier
    public void valider() {
        if (validitePermanente == null) {
            throw new IllegalArgumentException("Le type de validité doit être spécifié");
        }
        
        if (!validitePermanente && dateExpiration == null) {
            throw new IllegalArgumentException("La date d'expiration est obligatoire pour une validité limitée");
        }
        
        if (!validitePermanente && dateExpiration != null && dateExpiration.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La date d'expiration doit être dans le futur");
        }
    }

    // Getters et Setters
    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public Boolean getValiditePermanente() {
        return validitePermanente;
    }

    public void setValiditePermanente(Boolean validitePermanente) {
        this.validitePermanente = validitePermanente;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDateTime dateExpiration) {
        this.dateExpiration = dateExpiration;
    }
}
