package com.intermediation.expertise.model;

import jakarta.persistence.*;

/**
 * Entité de liaison entre une tâche et les compétences requises.
 */
@Entity
@Table(name = "taches_competences_requises",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tache_id", "competence_reference_id"}))
public class TacheCompetenceRequise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tache_id", nullable = false)
    private TacheProjet tache;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "competence_reference_id", nullable = false)
    private CompetenceReference competenceReference;

    @Column(name = "niveau_requis")
    private Integer niveauRequis = 3; // 1-5

    @Column(name = "est_obligatoire")
    private Boolean estObligatoire = true;

    // Constructeurs
    public TacheCompetenceRequise() {
    }

    public TacheCompetenceRequise(TacheProjet tache, CompetenceReference competenceReference) {
        this.tache = tache;
        this.competenceReference = competenceReference;
    }

    public TacheCompetenceRequise(TacheProjet tache, CompetenceReference competenceReference,
                                   Integer niveauRequis, Boolean estObligatoire) {
        this.tache = tache;
        this.competenceReference = competenceReference;
        this.niveauRequis = niveauRequis;
        this.estObligatoire = estObligatoire;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TacheProjet getTache() {
        return tache;
    }

    public void setTache(TacheProjet tache) {
        this.tache = tache;
    }

    public CompetenceReference getCompetenceReference() {
        return competenceReference;
    }

    public void setCompetenceReference(CompetenceReference competenceReference) {
        this.competenceReference = competenceReference;
    }

    public Integer getNiveauRequis() {
        return niveauRequis;
    }

    public void setNiveauRequis(Integer niveauRequis) {
        this.niveauRequis = niveauRequis;
    }

    public Boolean getEstObligatoire() {
        return estObligatoire;
    }

    public void setEstObligatoire(Boolean estObligatoire) {
        this.estObligatoire = estObligatoire;
    }
}
