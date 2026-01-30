package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.Projet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO complet pour un projet avec toutes ses relations.
 */
public class ProjetDTO {

    private Long id;
    private String proprietaireId;
    private String nom;
    private String description;
    private BigDecimal budget;
    private String devise;
    private String statut;
    private String visibilite;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private LocalDate dateDebutPrevue;
    private LocalDate dateFinPrevue;
    private LocalDate dateDebutEffective;
    private LocalDate dateFinEffective;
    private Integer progression;
    private Integer nombreVues;

    // Relations
    private List<EtapeProjetDTO> etapes = new ArrayList<>();
    private List<TacheProjetDTO> tachesIndependantes = new ArrayList<>();
    private List<ExigenceProjetDTO> exigences = new ArrayList<>();

    // Statistiques calculées
    private Integer nombreTaches;
    private Integer nombreCandidatures;

    // Constructeurs
    public ProjetDTO() {}

    public ProjetDTO(Projet projet) {
        this.id = projet.getId();
        this.proprietaireId = projet.getProprietaireId() != null ? projet.getProprietaireId().toString() : null;
        this.nom = projet.getNom();
        this.description = projet.getDescription();
        this.budget = projet.getBudget();
        this.devise = projet.getDevise();
        this.statut = projet.getStatut() != null ? projet.getStatut().name() : null;
        this.visibilite = projet.getVisibilite() != null ? projet.getVisibilite().name() : null;
        this.dateCreation = projet.getDateCreation();
        this.dateModification = projet.getDateModification();
        this.dateDebutPrevue = projet.getDateDebutPrevue();
        this.dateFinPrevue = projet.getDateFinPrevue();
        this.dateDebutEffective = projet.getDateDebutEffective();
        this.dateFinEffective = projet.getDateFinEffective();
        this.progression = projet.getProgression();
        this.nombreVues = projet.getNombreVues();

        // Relations
        if (projet.getEtapes() != null) {
            this.etapes = projet.getEtapes().stream()
                    .map(EtapeProjetDTO::new)
                    .collect(Collectors.toList());
        }

        if (projet.getTaches() != null) {
            this.tachesIndependantes = projet.getTaches().stream()
                    .filter(t -> t.getEtape() == null)
                    .map(TacheProjetDTO::new)
                    .collect(Collectors.toList());
        }

        if (projet.getExigences() != null) {
            this.exigences = projet.getExigences().stream()
                    .map(ExigenceProjetDTO::new)
                    .collect(Collectors.toList());
        }

        // Statistiques
        this.nombreTaches = projet.getTaches() != null ? projet.getTaches().size() : 0;
        this.nombreCandidatures = projet.getCandidatures() != null ? projet.getCandidatures().size() : 0;
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

    public Integer getNombreVues() {
        return nombreVues;
    }

    public void setNombreVues(Integer nombreVues) {
        this.nombreVues = nombreVues;
    }

    public List<EtapeProjetDTO> getEtapes() {
        return etapes;
    }

    public void setEtapes(List<EtapeProjetDTO> etapes) {
        this.etapes = etapes;
    }

    public List<TacheProjetDTO> getTachesIndependantes() {
        return tachesIndependantes;
    }

    public void setTachesIndependantes(List<TacheProjetDTO> tachesIndependantes) {
        this.tachesIndependantes = tachesIndependantes;
    }

    public List<ExigenceProjetDTO> getExigences() {
        return exigences;
    }

    public void setExigences(List<ExigenceProjetDTO> exigences) {
        this.exigences = exigences;
    }

    public Integer getNombreTaches() {
        return nombreTaches;
    }

    public void setNombreTaches(Integer nombreTaches) {
        this.nombreTaches = nombreTaches;
    }

    public Integer getNombreCandidatures() {
        return nombreCandidatures;
    }

    public void setNombreCandidatures(Integer nombreCandidatures) {
        this.nombreCandidatures = nombreCandidatures;
    }
}
