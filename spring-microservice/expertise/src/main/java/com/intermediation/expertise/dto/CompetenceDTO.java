package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.Competence;

import java.time.LocalDateTime;

/**
 * DTO pour les compétences utilisateur
 */
public class CompetenceDTO {
    
    private Long id;
    private String nom;
    private String description;
    private Integer niveauMaitrise;
    private Integer anneesExperience;
    private Integer thm;
    private Integer nombreProjets;
    private String certifications;
    private Boolean estFavorite;
    private Integer nombreDemandes;
    private LocalDateTime dateAjout;
    private Long competenceReferenceId; // ID de la compétence de référence d'origine

    // Constructeurs
    public CompetenceDTO() {}

    public CompetenceDTO(Competence competence) {
        this.id = competence.getId();
        this.nom = competence.getNom();
        this.description = competence.getDescription();
        this.niveauMaitrise = competence.getNiveauMaitrise();
        this.anneesExperience = competence.getAnneesExperience();
        this.thm = competence.getThm();
        this.nombreProjets = competence.getNombreProjets();
        this.certifications = competence.getCertifications();
        this.estFavorite = competence.getEstFavorite();
        this.nombreDemandes = competence.getNombreDemandes();
        this.dateAjout = competence.getDateAjout();
        this.competenceReferenceId = competence.getCompetenceReferenceId();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getCompetenceReferenceId() {
        return competenceReferenceId;
    }

    public void setCompetenceReferenceId(Long competenceReferenceId) {
        this.competenceReferenceId = competenceReferenceId;
    }
}
