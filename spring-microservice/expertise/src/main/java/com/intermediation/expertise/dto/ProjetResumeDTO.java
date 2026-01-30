package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.Projet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO résumé pour afficher un projet dans une liste (feed public).
 */
public class ProjetResumeDTO {

    private Long id;
    private String proprietaireId;
    private String nom;
    private String description;
    private BigDecimal budget;
    private String devise;
    private String statut;
    private String visibilite;
    private LocalDate dateDebutPrevue;
    private LocalDate dateFinPrevue;
    private Integer progression;
    private Integer nombreVues;
    private LocalDateTime dateCreation;

    // Statistiques
    private Integer nombreTaches;
    private Integer nombreTachesDisponibles;
    private Integer nombreCandidatures;
    private Integer nombreEtapes;

    // Constructeurs
    public ProjetResumeDTO() {}

    public ProjetResumeDTO(Projet projet) {
        this.id = projet.getId();
        this.proprietaireId = projet.getProprietaireId();
        this.nom = projet.getNom();
        this.description = projet.getDescription();
        this.budget = projet.getBudget();
        this.devise = projet.getDevise();
        this.statut = projet.getStatut() != null ? projet.getStatut().name() : null;
        this.visibilite = projet.getVisibilite() != null ? projet.getVisibilite().name() : null;
        this.dateDebutPrevue = projet.getDateDebutPrevue();
        this.dateFinPrevue = projet.getDateFinPrevue();
        this.progression = projet.getProgression();
        this.nombreVues = projet.getNombreVues();
        this.dateCreation = projet.getDateCreation();

        // Statistiques
        this.nombreTaches = projet.getTaches() != null ? projet.getTaches().size() : 0;
        this.nombreTachesDisponibles = projet.getTaches() != null ?
                (int) projet.getTaches().stream().filter(t -> t.estDisponible()).count() : 0;
        this.nombreCandidatures = projet.getCandidatures() != null ? projet.getCandidatures().size() : 0;
        this.nombreEtapes = projet.getEtapes() != null ? projet.getEtapes().size() : 0;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProprietaireId() {
        return proprietaireId;
    }

    public void setProprietaireId(String proprietaireId) {
        this.proprietaireId = proprietaireId;
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
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

    public Integer getProgression() {
        return progression;
    }

    public void setProgression(Integer progression) {
        this.progression = progression;
    }

    public Integer getNombreVues() {
        return nombreVues;
    }

    public void setNombreVues(Integer nombreVues) {
        this.nombreVues = nombreVues;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Integer getNombreTaches() {
        return nombreTaches;
    }

    public void setNombreTaches(Integer nombreTaches) {
        this.nombreTaches = nombreTaches;
    }

    public Integer getNombreTachesDisponibles() {
        return nombreTachesDisponibles;
    }

    public void setNombreTachesDisponibles(Integer nombreTachesDisponibles) {
        this.nombreTachesDisponibles = nombreTachesDisponibles;
    }

    public Integer getNombreCandidatures() {
        return nombreCandidatures;
    }

    public void setNombreCandidatures(Integer nombreCandidatures) {
        this.nombreCandidatures = nombreCandidatures;
    }

    public Integer getNombreEtapes() {
        return nombreEtapes;
    }

    public void setNombreEtapes(Integer nombreEtapes) {
        this.nombreEtapes = nombreEtapes;
    }
}
