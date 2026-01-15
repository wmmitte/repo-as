package com.intermediation.auth.dto;

import com.intermediation.auth.model.TypePersonne;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * DTO pour la requête de mise à jour du profil utilisateur
 */
public class UpdateProfilRequest {
    
    @NotNull(message = "Le type de personne est obligatoire")
    private TypePersonne typePersonne;
    
    // Informations personnelles obligatoires
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;

    // Prénom obligatoire uniquement pour les personnes physiques (validation dans le service)
    // Utilisation de @Size sans min pour permettre les chaînes vides (personnes morales)
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String prenom;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9\\s]{10,20}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotNull(message = "La date de naissance/création est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    // Informations professionnelles optionnelles
    private String domaineExpertise;

    @Size(max = 2000, message = "La biographie ne peut pas dépasser 2000 caractères")
    private String biographie;
    
    // Domaines d'intérêt (JSON)
    private String domainesInteret;

    // Constructeurs
    public UpdateProfilRequest() {}

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

    public String getDomaineExpertise() {
        return domaineExpertise;
    }

    public void setDomaineExpertise(String domaineExpertise) {
        this.domaineExpertise = domaineExpertise;
    }

    public String getBiographie() {
        return biographie;
    }

    public void setBiographie(String biographie) {
        this.biographie = biographie;
    }

    public String getDomainesInteret() {
        return domainesInteret;
    }

    public void setDomainesInteret(String domainesInteret) {
        this.domainesInteret = domainesInteret;
    }
}
