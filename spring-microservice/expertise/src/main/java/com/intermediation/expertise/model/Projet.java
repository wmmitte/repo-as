package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un projet client.
 * Un projet peut contenir des étapes et des tâches.
 */
@Entity
@Table(name = "projets")
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "proprietaire_id", nullable = false)
    private String proprietaireId;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal budget = BigDecimal.ZERO;

    @Column(length = 10)
    private String devise = "FCFA";

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatutProjet statut = StatutProjet.BROUILLON;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Visibilite visibilite = Visibilite.PRIVE;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "date_debut_prevue")
    private LocalDate dateDebutPrevue;

    @Column(name = "date_fin_prevue")
    private LocalDate dateFinPrevue;

    @Column(name = "date_debut_effective")
    private LocalDate dateDebutEffective;

    @Column(name = "date_fin_effective")
    private LocalDate dateFinEffective;

    @Column
    private Integer progression = 0;

    @Column(name = "nombre_vues")
    private Integer nombreVues = 0;

    // Relations
    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<EtapeProjet> etapes = new ArrayList<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<TacheProjet> taches = new ArrayList<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<ExigenceProjet> exigences = new ArrayList<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidatureProjet> candidatures = new ArrayList<>();

    // Enums
    public enum StatutProjet {
        BROUILLON, PUBLIE, EN_COURS, EN_PAUSE, TERMINE, ANNULE
    }

    public enum Visibilite {
        PRIVE, PUBLIC
    }

    // Constructeurs
    public Projet() {
        this.dateCreation = LocalDateTime.now();
    }

    public Projet(String proprietaireId, String nom) {
        this.proprietaireId = proprietaireId;
        this.nom = nom;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void ajouterEtape(EtapeProjet etape) {
        etapes.add(etape);
        etape.setProjet(this);
    }

    public void supprimerEtape(EtapeProjet etape) {
        etapes.remove(etape);
        etape.setProjet(null);
    }

    public void ajouterTache(TacheProjet tache) {
        taches.add(tache);
        tache.setProjet(this);
    }

    public void supprimerTache(TacheProjet tache) {
        taches.remove(tache);
        tache.setProjet(null);
    }

    public void ajouterExigence(ExigenceProjet exigence) {
        exigences.add(exigence);
        exigence.setProjet(this);
    }

    public boolean estPublic() {
        return visibilite == Visibilite.PUBLIC && statut == StatutProjet.PUBLIE;
    }

    public void calculerProgression() {
        if (taches.isEmpty()) {
            this.progression = 0;
            return;
        }
        int total = taches.stream()
                .mapToInt(t -> t.getProgression() != null ? t.getProgression() : 0)
                .sum();
        this.progression = total / taches.size();
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

    public StatutProjet getStatut() {
        return statut;
    }

    public void setStatut(StatutProjet statut) {
        this.statut = statut;
    }

    public Visibilite getVisibilite() {
        return visibilite;
    }

    public void setVisibilite(Visibilite visibilite) {
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

    public List<EtapeProjet> getEtapes() {
        return etapes;
    }

    public void setEtapes(List<EtapeProjet> etapes) {
        this.etapes = etapes;
    }

    public List<TacheProjet> getTaches() {
        return taches;
    }

    public void setTaches(List<TacheProjet> taches) {
        this.taches = taches;
    }

    public List<ExigenceProjet> getExigences() {
        return exigences;
    }

    public void setExigences(List<ExigenceProjet> exigences) {
        this.exigences = exigences;
    }

    public List<CandidatureProjet> getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(List<CandidatureProjet> candidatures) {
        this.candidatures = candidatures;
    }
}
