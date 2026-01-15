package com.intermediation.auth.dto;

import com.intermediation.auth.model.TypePersonne;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * DTO pour les informations personnelles de l'utilisateur
 * Tous ces champs sont obligatoires pour compléter le profil
 */
public class ProfilPersonnelDTO {
    
    private TypePersonne typePersonne;
    private String nom;
    private String prenom; // Null pour les personnes morales
    private String email;
    private String telephone;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;
    
    private String photoUrl;

    // Constructeurs
    public ProfilPersonnelDTO() {}

    // Getters et Setters
    public TypePersonne getTypePersonne() {
        return typePersonne;
    }

    public void setTypePersonne(TypePersonne typePersonne) {
        this.typePersonne = typePersonne;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
