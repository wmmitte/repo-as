package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une étape d'un projet.
 * Une étape regroupe plusieurs tâches (mini-projet).
 */
@Entity
@Table(name = "etapes_projet")
public class EtapeProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer ordre = 0;

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

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Relations
    @OneToMany(mappedBy = "etape", cascade = CascadeType.ALL)
    @OrderBy("ordre ASC")
    private List<TacheProjet> taches = new ArrayList<>();

    // Constructeurs
    public EtapeProjet() {
        this.dateCreation = LocalDateTime.now();
    }

    public EtapeProjet(Projet projet, String nom) {
        this.projet = projet;
        this.nom = nom;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void ajouterTache(TacheProjet tache) {
        taches.add(tache);
        tache.setEtape(this);
    }

    public void supprimerTache(TacheProjet tache) {
        taches.remove(tache);
        tache.setEtape(null);
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

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
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

    public List<TacheProjet> getTaches() {
        return taches;
    }

    public void setTaches(List<TacheProjet> taches) {
        this.taches = taches;
    }
}
