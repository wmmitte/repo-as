package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une compétence d'un utilisateur
 */
@Entity
@Table(name = "competences")
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private String utilisateurId;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 500)
    private String description;

    @Column(name = "niveau_maitrise")
    private Integer niveauMaitrise; // 1-5

    @Column(name = "annees_experience")
    private Integer anneesExperience;

    @Column(name = "thm")
    private Integer thm; // Taux Horaire Moyen en FCFA

    @Column(name = "nombre_projets")
    private Integer nombreProjets = 0;

    @Column(length = 500)
    private String certifications; // Liste de certifications séparées par des virgules

    @Column(name = "est_favorite")
    private Boolean estFavorite = false;

    @Column(name = "nombre_demandes")
    private Integer nombreDemandes = 0;

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "competence_reference_id")
    private Long competenceReferenceId; // ID de la compétence de référence d'origine

    // Constructeurs
    public Competence() {}

    public Competence(String utilisateurId, String nom) {
        this.utilisateurId = utilisateurId;
        this.nom = nom;
        this.dateAjout = LocalDateTime.now();
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

    public Integer getNiveauMaitrise() {
        return niveauMaitrise;
    }

    public void setNiveauMaitrise(Integer niveauMaitrise) {
        this.niveauMaitrise = niveauMaitrise;
    }

    public Integer getAnneesExperience() {
        return anneesExperience;
    }

    public void setAnneesExperience(Integer anneesExperience) {
        this.anneesExperience = anneesExperience;
    }

    public Integer getThm() {
        return thm;
    }

    public void setThm(Integer thm) {
        this.thm = thm;
    }

    public Integer getNombreProjets() {
        return nombreProjets;
    }

    public void setNombreProjets(Integer nombreProjets) {
        this.nombreProjets = nombreProjets;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public Boolean getEstFavorite() {
        return estFavorite;
    }

    public void setEstFavorite(Boolean estFavorite) {
        this.estFavorite = estFavorite;
    }

    public Integer getNombreDemandes() {
        return nombreDemandes;
    }

    public void setNombreDemandes(Integer nombreDemandes) {
        this.nombreDemandes = nombreDemandes;
    }

    public LocalDateTime getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(LocalDateTime dateAjout) {
        this.dateAjout = dateAjout;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public Long getCompetenceReferenceId() {
        return competenceReferenceId;
    }

    public void setCompetenceReferenceId(Long competenceReferenceId) {
        this.competenceReferenceId = competenceReferenceId;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}

