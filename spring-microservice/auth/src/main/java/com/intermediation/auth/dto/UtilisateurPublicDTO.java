package com.intermediation.auth.dto;

import com.intermediation.auth.model.TypePersonne;

/**
 * DTO pour exposer les informations publiques d'un utilisateur
 */
public class UtilisateurPublicDTO {
    
    private String id;
    private String nom;
    private String prenom;
    private String photoUrl;
    private TypePersonne typePersonne;
    private boolean hasPhoto; // true si l'utilisateur a une photo uploadée ou une URL externe

    public UtilisateurPublicDTO() {}
    
    // Getters et Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public TypePersonne getTypePersonne() {
        return typePersonne;
    }
    
    public void setTypePersonne(TypePersonne typePersonne) {
        this.typePersonne = typePersonne;
    }

    public boolean isHasPhoto() {
        return hasPhoto;
    }

    public void setHasPhoto(boolean hasPhoto) {
        this.hasPhoto = hasPhoto;
    }
}
