package com.intermediation.expertise.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request pour modifier un projet existant.
 */
public class ModifierProjetRequest {

    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    private String description;

    private BigDecimal budget;

    private String devise;

    private String visibilite;

    private LocalDate dateDebutPrevue;

    private LocalDate dateFinPrevue;

    // Constructeurs
    public ModifierProjetRequest() {}

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
}
