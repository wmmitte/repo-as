package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.EtapeProjet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO pour une étape de projet.
 */
public class EtapeProjetDTO {

    private Long id;
    private Long projetId;
    private String nom;
    private String description;
    private Integer ordre;
    private LocalDate dateDebutPrevue;
    private LocalDate dateFinPrevue;
    private LocalDate dateDebutEffective;
    private LocalDate dateFinEffective;
    private Integer progression;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Tâches de cette étape
    private List<TacheProjetDTO> taches = new ArrayList<>();

    // Constructeurs
    public EtapeProjetDTO() {}

    public EtapeProjetDTO(EtapeProjet etape) {
        this.id = etape.getId();
        this.projetId = etape.getProjet() != null ? etape.getProjet().getId() : null;
        this.nom = etape.getNom();
        this.description = etape.getDescription();
        this.ordre = etape.getOrdre();
        this.dateDebutPrevue = etape.getDateDebutPrevue();
        this.dateFinPrevue = etape.getDateFinPrevue();
        this.dateDebutEffective = etape.getDateDebutEffective();
        this.dateFinEffective = etape.getDateFinEffective();
        this.progression = etape.getProgression();
        this.dateCreation = etape.getDateCreation();
        this.dateModification = etape.getDateModification();

        if (etape.getTaches() != null) {
            this.taches = etape.getTaches().stream()
                    .map(TacheProjetDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDate getDateDebutEffective() {
        return dateDebutEffective;
    }

    public void setDateDebutEffective(LocalDate dateDebutEffective) {
        this.dateDebutEffective = dateDebutEffective;
    }

    public LocalDate getDateFinEffective() {
        return dateFinEffective;
    }

    public void setDateFinEffective(LocalDate dateFinEffective) {
        this.dateFinEffective = dateFinEffective;
    }

    public Integer getProgression() {
        return progression;
    }

    public void setProgression(Integer progression) {
        this.progression = progression;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public List<TacheProjetDTO> getTaches() {
        return taches;
    }

    public void setTaches(List<TacheProjetDTO> taches) {
        this.taches = taches;
    }
}
