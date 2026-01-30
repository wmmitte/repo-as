package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request pour créer un nouveau projet.
 */
public class CreerProjetRequest {

    @NotBlank(message = "Le nom du projet est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    private String description;

    private BigDecimal budget;

    private String devise = "FCFA";

    private String visibilite = "PRIVE"; // PRIVE ou PUBLIC

    private LocalDate dateDebutPrevue;

    private LocalDate dateFinPrevue;

    // Exigences du projet (optionnel)
    private List<String> exigences;

    // Constructeurs
    public CreerProjetRequest() {}

    // Getters et Setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public String getDevise() {
        return devise;
    }

    public void setDevise(String devise) {
        this.devise = devise;
    }

    public String getVisibilite() {
        return visibilite;
    }

    public void setVisibilite(String visibilite) {
        this.visibilite = visibilite;
    }

    public LocalDate getDateDebutPrevue() {
        return dateDebutPrevue;
    }

    public void setDateDebutPrevue(LocalDate dateDebutPrevue) {
        this.dateDebutPrevue = dateDebutPrevue;
    }

    public LocalDate getDateFinPrevue() {
        return dateFinPrevue;
    }

    public void setDateFinPrevue(LocalDate dateFinPrevue) {
        this.dateFinPrevue = dateFinPrevue;
    }

    public List<String> getExigences() {
        return exigences;
    }

    public void setExigences(List<String> exigences) {
        this.exigences = exigences;
    }
}
