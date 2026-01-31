package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.TacheProjet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO complet pour une tâche de projet.
 */
public class TacheProjetDTO {

    private Long id;
    private Long projetId;
    private String projetNom;
    private Long etapeId;
    private String etapeNom;
    private String nom;
    private String description;
    private Integer ordre;
    private BigDecimal budget;
    private Integer delaiJours;
    private String statut;
    private String visibilite;
    private String priorite;
    private Integer progression;
    private String expertAssigneId;
    private String expertNom;
    private String expertPrenom;
    private String expertPhotoUrl;
    private LocalDateTime dateAssignation;
    private LocalDate dateDebutPrevue;
    private LocalDate dateFinPrevue;
    private LocalDate dateDebutEffective;
    private LocalDate dateFinEffective;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Relations
    private List<LivrableTacheDTO> livrables = new ArrayList<>();
    private List<CompetenceRequiseDTO> competencesRequises = new ArrayList<>();

    // Statistiques
    private Integer nombreLivrables;
    private Integer nombreLivrablesValides;
    private Integer nombreCandidatures;

    // Indicateurs
    private Boolean estIndependante;
    private Boolean estDisponible;

    // Constructeurs
    public TacheProjetDTO() {}

    public TacheProjetDTO(TacheProjet tache) {
        this.id = tache.getId();
        this.projetId = tache.getProjet() != null ? tache.getProjet().getId() : null;
        this.projetNom = tache.getProjet() != null ? tache.getProjet().getNom() : null;
        this.etapeId = tache.getEtape() != null ? tache.getEtape().getId() : null;
        this.etapeNom = tache.getEtape() != null ? tache.getEtape().getNom() : null;
        this.nom = tache.getNom();
        this.description = tache.getDescription();
        this.ordre = tache.getOrdre();
        this.budget = tache.getBudget();
        this.delaiJours = tache.getDelaiJours();
        this.statut = tache.getStatut() != null ? tache.getStatut().name() : null;
        this.visibilite = tache.getVisibilite() != null ? tache.getVisibilite().name() : null;
        this.priorite = tache.getPriorite() != null ? tache.getPriorite().name() : null;
        this.progression = tache.getProgression();
        this.expertAssigneId = tache.getExpertAssigneId() != null ? tache.getExpertAssigneId().toString() : null;
        this.dateAssignation = tache.getDateAssignation();
        this.dateDebutPrevue = tache.getDateDebutPrevue();
        this.dateFinPrevue = tache.getDateFinPrevue();
        this.dateDebutEffective = tache.getDateDebutEffective();
        this.dateFinEffective = tache.getDateFinEffective();
        this.dateCreation = tache.getDateCreation();
        this.dateModification = tache.getDateModification();

        // Relations
        if (tache.getLivrables() != null) {
            this.livrables = tache.getLivrables().stream()
                    .map(LivrableTacheDTO::new)
                    .collect(Collectors.toList());
        }

        if (tache.getCompetencesRequises() != null) {
            this.competencesRequises = tache.getCompetencesRequises().stream()
                    .map(CompetenceRequiseDTO::new)
                    .collect(Collectors.toList());
        }

        // Statistiques
        this.nombreLivrables = tache.getLivrables() != null ? tache.getLivrables().size() : 0;
        this.nombreLivrablesValides = tache.getLivrables() != null ?
                (int) tache.getLivrables().stream()
                        .filter(l -> l.getStatut() == com.intermediation.expertise.model.LivrableTache.StatutLivrable.ACCEPTE)
                        .count() : 0;
        this.nombreCandidatures = tache.getCandidatures() != null ? tache.getCandidatures().size() : 0;

        // Indicateurs
        this.estIndependante = tache.estIndependante();
        this.estDisponible = tache.estDisponible();
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

    public String getProjetNom() {
        return projetNom;
    }

    public void setProjetNom(String projetNom) {
        this.projetNom = projetNom;
    }

    public Long getEtapeId() {
        return etapeId;
    }

    public void setEtapeId(Long etapeId) {
        this.etapeId = etapeId;
    }

    public String getEtapeNom() {
        return etapeNom;
    }

    public void setEtapeNom(String etapeNom) {
        this.etapeNom = etapeNom;
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

    public String getExpertAssigneId() {
        return expertAssigneId;
    }

    public void setExpertAssigneId(String expertAssigneId) {
        this.expertAssigneId = expertAssigneId;
    }

    public String getExpertNom() {
        return expertNom;
    }

    public void setExpertNom(String expertNom) {
        this.expertNom = expertNom;
    }

    public String getExpertPrenom() {
        return expertPrenom;
    }

    public void setExpertPrenom(String expertPrenom) {
        this.expertPrenom = expertPrenom;
    }

    public String getExpertPhotoUrl() {
        return expertPhotoUrl;
    }

    public void setExpertPhotoUrl(String expertPhotoUrl) {
        this.expertPhotoUrl = expertPhotoUrl;
    }

    public LocalDateTime getDateAssignation() {
        return dateAssignation;
    }

    public void setDateAssignation(LocalDateTime dateAssignation) {
        this.dateAssignation = dateAssignation;
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

    public List<LivrableTacheDTO> getLivrables() {
        return livrables;
    }

    public void setLivrables(List<LivrableTacheDTO> livrables) {
        this.livrables = livrables;
    }

    public List<CompetenceRequiseDTO> getCompetencesRequises() {
        return competencesRequises;
    }

    public void setCompetencesRequises(List<CompetenceRequiseDTO> competencesRequises) {
        this.competencesRequises = competencesRequises;
    }

    public Integer getNombreLivrables() {
        return nombreLivrables;
    }

    public void setNombreLivrables(Integer nombreLivrables) {
        this.nombreLivrables = nombreLivrables;
    }

    public Integer getNombreLivrablesValides() {
        return nombreLivrablesValides;
    }

    public void setNombreLivrablesValides(Integer nombreLivrablesValides) {
        this.nombreLivrablesValides = nombreLivrablesValides;
    }

    public Integer getNombreCandidatures() {
        return nombreCandidatures;
    }

    public void setNombreCandidatures(Integer nombreCandidatures) {
        this.nombreCandidatures = nombreCandidatures;
    }

    public Boolean getEstIndependante() {
        return estIndependante;
    }

    public void setEstIndependante(Boolean estIndependante) {
        this.estIndependante = estIndependante;
    }

    public Boolean getEstDisponible() {
        return estDisponible;
    }

    public void setEstDisponible(Boolean estDisponible) {
        this.estDisponible = estDisponible;
    }
}
