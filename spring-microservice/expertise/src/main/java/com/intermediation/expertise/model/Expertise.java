package com.intermediation.expertise.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité représentant le profil d'expertise complet d'un utilisateur
 * Relation 1:1 avec Utilisateur (via utilisateur_id)
 */
@Entity
@Table(name = "expertises")
public class Expertise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false, unique = true)
    private String utilisateurId;

    @Column(length = 200)
    private String titre; // Ex: "Développeur Full Stack Senior"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url")
    private String photoUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ville_id")
    private Ville ville;

    @Column(nullable = false)
    private Boolean disponible = true;

    @Column(nullable = false)
    private Boolean publiee = false; // Si true, visible sur l'accueil

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Système de scoring
    @Column(name = "score_global", precision = 10, scale = 2)
    private BigDecimal scoreGlobal = BigDecimal.ZERO;

    @Column(name = "score_details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String scoreDetails; // JSON avec le détail des scores

    @Column(name = "date_calcul_score")
    private LocalDateTime dateCalculScore;

    // Constructeurs
    public Expertise() {
        this.dateCreation = LocalDateTime.now();
    }

    public Expertise(String utilisateurId) {
        this.utilisateurId = utilisateurId;
        this.dateCreation = LocalDateTime.now();
        this.disponible = true;
        this.publiee = false;
    }

    // Méthode pour obtenir la localisation complète
    public String getLocalisation() {
        if (ville != null) {
            return ville.getNom() + ", " + ville.getPays().getNom();
        }
        return null;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Ville getVille() {
        return ville;
    }

    public void setVille(Ville ville) {
        this.ville = ville;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Boolean getPubliee() {
        return publiee;
    }

    public void setPubliee(Boolean publiee) {
        this.publiee = publiee;
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

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }

    // Getters et Setters pour le scoring
    public BigDecimal getScoreGlobal() {
        return scoreGlobal;
    }

    public void setScoreGlobal(BigDecimal scoreGlobal) {
        this.scoreGlobal = scoreGlobal;
    }

    public String getScoreDetails() {
        return scoreDetails;
    }

    public void setScoreDetails(String scoreDetails) {
        this.scoreDetails = scoreDetails;
    }

    public LocalDateTime getDateCalculScore() {
        return dateCalculScore;
    }

    public void setDateCalculScore(LocalDateTime dateCalculScore) {
        this.dateCalculScore = dateCalculScore;
    }
}
