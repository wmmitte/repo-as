package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une tâche d'un projet.
 * Une tâche peut être indépendante ou appartenir à une étape.
 */
@Entity
@Table(name = "taches_projet")
public class TacheProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etape_id")
    private EtapeProjet etape; // Nullable - si null, tâche indépendante

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer ordre = 0;

    @Column(precision = 15, scale = 2)
    private BigDecimal budget = BigDecimal.ZERO;

    @Column(name = "delai_jours")
    private Integer delaiJours;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatutTache statut = StatutTache.A_FAIRE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VisibiliteTache visibilite = VisibiliteTache.HERITEE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priorite priorite = Priorite.NORMALE;

    @Column
    private Integer progression = 0;

    @Column(name = "expert_assigne_id")
    private String expertAssigneId;

    @Column(name = "date_assignation")
    private LocalDateTime dateAssignation;

    @Column(name = "date_debut_prevue")
    private LocalDate dateDebutPrevue;

    @Column(name = "date_fin_prevue")
    private LocalDate dateFinPrevue;

    @Column(name = "date_debut_effective")
    private LocalDate dateDebutEffective;

    @Column(name = "date_fin_effective")
    private LocalDate dateFinEffective;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Relations
    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LivrableTache> livrables = new ArrayList<>();

    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TacheCompetenceRequise> competencesRequises = new ArrayList<>();

    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentaireTache> commentaires = new ArrayList<>();

    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidatureProjet> candidatures = new ArrayList<>();

    // Enums
    public enum StatutTache {
        A_FAIRE, EN_COURS, EN_REVUE, TERMINEE, BLOQUEE, ANNULEE
    }

    public enum VisibiliteTache {
        HERITEE, PRIVE, PUBLIC
    }

    public enum Priorite {
        BASSE, NORMALE, HAUTE, URGENTE
    }

    // Constructeurs
    public TacheProjet() {
        this.dateCreation = LocalDateTime.now();
    }

    public TacheProjet(Projet projet, String nom) {
        this.projet = projet;
        this.nom = nom;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void ajouterLivrable(LivrableTache livrable) {
        livrables.add(livrable);
        livrable.setTache(this);
    }

    public void supprimerLivrable(LivrableTache livrable) {
        livrables.remove(livrable);
        livrable.setTache(null);
    }

    public void ajouterCompetenceRequise(TacheCompetenceRequise competence) {
        competencesRequises.add(competence);
        competence.setTache(this);
    }

    public boolean estIndependante() {
        return etape == null;
    }

    public boolean estDisponible() {
        return expertAssigneId == null && statut == StatutTache.A_FAIRE;
    }

    public boolean estVisiblePubliquement() {
        if (visibilite == VisibiliteTache.PUBLIC) return true;
        if (visibilite == VisibiliteTache.PRIVE) return false;
        // HERITEE - hérite du projet
        return projet != null && projet.estPublic();
    }

    public void assignerExpert(String expertId) {
        this.expertAssigneId = expertId;
        this.dateAssignation = LocalDateTime.now();
        if (this.statut == StatutTache.A_FAIRE) {
            this.statut = StatutTache.EN_COURS;
        }
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public EtapeProjet getEtape() {
        return etape;
    }

    public void setEtape(EtapeProjet etape) {
        this.etape = etape;
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

    public StatutTache getStatut() {
        return statut;
    }

    public void setStatut(StatutTache statut) {
        this.statut = statut;
    }

    public VisibiliteTache getVisibilite() {
        return visibilite;
    }

    public void setVisibilite(VisibiliteTache visibilite) {
        this.visibilite = visibilite;
    }

    public Priorite getPriorite() {
        return priorite;
    }

    public void setPriorite(Priorite priorite) {
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

    public List<LivrableTache> getLivrables() {
        return livrables;
    }

    public void setLivrables(List<LivrableTache> livrables) {
        this.livrables = livrables;
    }

    public List<TacheCompetenceRequise> getCompetencesRequises() {
        return competencesRequises;
    }

    public void setCompetencesRequises(List<TacheCompetenceRequise> competencesRequises) {
        this.competencesRequises = competencesRequises;
    }

    public List<CommentaireTache> getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(List<CommentaireTache> commentaires) {
        this.commentaires = commentaires;
    }

    public List<CandidatureProjet> getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(List<CandidatureProjet> candidatures) {
        this.candidatures = candidatures;
    }
}
