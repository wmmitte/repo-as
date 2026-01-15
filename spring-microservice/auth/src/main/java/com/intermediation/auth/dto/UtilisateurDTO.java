package com.intermediation.auth.dto;

import com.intermediation.auth.model.Utilisateur;

import java.util.List;

/**
 * DTO pour représenter un utilisateur avec ses informations de base
 */
public class UtilisateurDTO {
    private String id;
    private String email;
    private String nom;
    private String prenom;
    private String username;
    private boolean enabled;
    private List<String> roles; // Rôles de l'utilisateur (expert, rh, manager)

    public UtilisateurDTO() {
    }

    public UtilisateurDTO(String id, String email, String nom, String prenom) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
    }

    /**
     * Constructeur à partir d'un modèle Utilisateur
     * Utilisé par AuthController pour convertir l'entité en DTO
     */
    public UtilisateurDTO(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.email = utilisateur.getEmail();
        this.nom = utilisateur.getNom();
        this.prenom = utilisateur.getPrenom();
        this.username = utilisateur.getEmail(); // Utiliser l'email comme username
        this.enabled = Boolean.TRUE.equals(utilisateur.getActif());
    }

    // Getters et Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
