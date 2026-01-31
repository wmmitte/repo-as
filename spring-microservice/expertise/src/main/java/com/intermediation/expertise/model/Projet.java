package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

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
    private UUID proprietaireId;

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

    // Relations - Utilisation de Set pour éviter MultipleBagFetchException
    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private Set<EtapeProjet> etapes = new HashSet<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private Set<TacheProjet> taches = new HashSet<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private Set<ExigenceProjet> exigences = new HashSet<>();

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CandidatureProjet> candidatures = new HashSet<>();

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

    public Projet(UUID proprietaireId, String nom) {
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
                .mapToInt(t -> {
                    // Une tâche TERMINEE compte pour 100% même si sa progression interne est différente
                    if (t.getStatut() == TacheProjet.StatutTache.TERMINEE) {
                        return 100;
                    }
                    return t.getProgression() != null ? t.getProgression() : 0;
                })
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

    public UUID getProprietaireId() {
        return proprietaireId;
    }

    public void setProprietaireId(UUID proprietaireId) {
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

    public Set<EtapeProjet> getEtapes() {
        return etapes;
    }

    public void setEtapes(Set<EtapeProjet> etapes) {
        this.etapes = etapes;
    }

    public Set<TacheProjet> getTaches() {
        return taches;
    }

    public void setTaches(Set<TacheProjet> taches) {
        this.taches = taches;
    }

    public Set<ExigenceProjet> getExigences() {
        return exigences;
    }

    public void setExigences(Set<ExigenceProjet> exigences) {
        this.exigences = exigences;
    }

    public Set<CandidatureProjet> getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(Set<CandidatureProjet> candidatures) {
        this.candidatures = candidatures;
    }
}
