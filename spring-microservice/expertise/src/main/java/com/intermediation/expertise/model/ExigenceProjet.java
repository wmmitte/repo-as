package com.intermediation.expertise.model;

import jakarta.persistence.*;

/**
 * Entité représentant une exigence du projet.
 */
@Entity
@Table(name = "exigences_projet")
public class ExigenceProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String categorie;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priorite priorite = Priorite.NORMALE;

    @Column
    private Integer ordre = 0;

    // Enum
    public enum Priorite {
        BASSE, NORMALE, HAUTE, CRITIQUE
    }

    // Constructeurs
    public ExigenceProjet() {
    }

    public ExigenceProjet(Projet projet, String description) {
        this.projet = projet;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public Priorite getPriorite() {
        return priorite;
    }

    public void setPriorite(Priorite priorite) {
        this.priorite = priorite;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }
}
