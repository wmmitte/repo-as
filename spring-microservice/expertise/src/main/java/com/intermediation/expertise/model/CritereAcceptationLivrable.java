package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un critère d'acceptation d'un livrable.
 */
@Entity
@Table(name = "criteres_acceptation_livrable")
public class CritereAcceptationLivrable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livrable_id", nullable = false)
    private LivrableTache livrable;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer ordre = 0;

    @Column(name = "est_valide")
    private Boolean estValide = false;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    // Constructeurs
    public CritereAcceptationLivrable() {
    }

    public CritereAcceptationLivrable(LivrableTache livrable, String description) {
        this.livrable = livrable;
        this.description = description;
    }

    // Méthodes utilitaires
    public void valider(String commentaire) {
        this.estValide = true;
        this.commentaire = commentaire;
        this.dateValidation = LocalDateTime.now();
    }

    public void invalider(String commentaire) {
        this.estValide = false;
        this.commentaire = commentaire;
        this.dateValidation = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LivrableTache getLivrable() {
        return livrable;
    }

    public void setLivrable(LivrableTache livrable) {
        this.livrable = livrable;
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

    public Boolean getEstValide() {
        return estValide;
    }

    public void setEstValide(Boolean estValide) {
        this.estValide = estValide;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public void setDateValidation(LocalDateTime dateValidation) {
        this.dateValidation = dateValidation;
    }
}
