package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request pour créer une étape de projet.
 */
public class CreerEtapeRequest {

    @NotNull(message = "L'ID du projet est obligatoire")
    private Long projetId;

    @NotBlank(message = "Le nom de l'étape est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    private String description;

    private Integer ordre;

    private LocalDate dateDebutPrevue;

    private LocalDate dateFinPrevue;

    // Constructeurs
    public CreerEtapeRequest() {}

    // Getters et Setters
    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

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
