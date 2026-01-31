package com.intermediation.expertise.dto;

/**
 * DTO représentant un utilisateur RH avec ses statistiques de traitement
 */
public class UtilisateurRhDTO {

    private String userId;
    private String nom;
    private String prenom;
    private String email;
    private String photoUrl;
    private Long nombreDemandesEnCours;
    private Long nombreDemandesTraitees;
    private Double tauxApprobation;
    private Double noteMoyenne;

    public UtilisateurRhDTO() {
    }

    public UtilisateurRhDTO(String userId, String email) {
        this.userId = userId;
        this.email = email;
        this.nom = extractNomFromEmail(email);
        this.nombreDemandesEnCours = 0L;
        this.nombreDemandesTraitees = 0L;
        this.tauxApprobation = 0.0;
        this.noteMoyenne = 0.0;
    }

    /**
     * Extrait un nom d'affichage depuis un email
     */
    private String extractNomFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String localPart = email.substring(0, email.indexOf("@"));
        // Remplacer . et _ par des espaces et capitaliser
        return localPart.replace(".", " ")
                        .replace("_", " ")
                        .replace("-", " ");
    }

    // Getters et Setters

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getNombreDemandesEnCours() {
        return nombreDemandesEnCours;
    }

    public void setNombreDemandesEnCours(Long nombreDemandesEnCours) {
        this.nombreDemandesEnCours = nombreDemandesEnCours;
    }

    public Long getNombreDemandesTraitees() {
        return nombreDemandesTraitees;
    }

    public void setNombreDemandesTraitees(Long nombreDemandesTraitees) {
        this.nombreDemandesTraitees = nombreDemandesTraitees;
    }

    public Double getTauxApprobation() {
        return tauxApprobation;
    }

    public void setTauxApprobation(Double tauxApprobation) {
        this.tauxApprobation = tauxApprobation;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }
}
