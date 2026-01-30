package com.intermediation.expertise.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request pour modifier une tâche existante.
 */
public class ModifierTacheRequest {

    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    private String description;

    private Integer ordre;

    private BigDecimal budget;

    private Integer delaiJours;

    private String visibilite;

    private String priorite;

    private Integer progression;

    private LocalDate dateDebutPrevue;

    private LocalDate dateFinPrevue;

    // Constructeurs
    public ModifierTacheRequest() {}

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

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public Integer getDelaiJours() {
        return delaiJours;
    }

    public void setDelaiJours(Integer delaiJours) {
        this.delaiJours = delaiJours;
    }

    public String getVisibilite() {
        return visibilite;
    }

    public void setVisibilite(String visibilite) {
        this.visibilite = visibilite;
    }

    public String getPriorite() {
        return priorite;
    }

    public void setPriorite(String priorite) {
        this.priorite = priorite;
    }

    public Integer getProgression() {
        return progression;
    }

    public void setProgression(Integer progression) {
        this.progression = progression;
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
