package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.BadgeCompetence;
import com.intermediation.expertise.model.BadgeCompetence.NiveauCertification;

import java.time.LocalDateTime;

/**
 * DTO pour les badges de compétence
 */
public class BadgeCompetenceDTO {

    private Long id;
    private Long competenceId;
    private String competenceNom;
    private String utilisateurId;
    private Long demandeReconnaissanceId;
    private LocalDateTime dateObtention;
    private NiveauCertification niveauCertification;
    private Boolean validitePermanente;
    private LocalDateTime dateExpiration;
    private Boolean estActif;
    private LocalDateTime dateRevocation;
    private String motifRevocation;
    private Boolean estPublic;
    private Integer ordreAffichage;
    private Boolean estValide; // Calculé

    // Constructeurs
    public BadgeCompetenceDTO() {}

    public BadgeCompetenceDTO(BadgeCompetence badge) {
        this.id = badge.getId();
        this.competenceId = badge.getCompetenceId();
        this.utilisateurId = badge.getUtilisateurId();
        this.demandeReconnaissanceId = badge.getDemandeReconnaissanceId();
        this.dateObtention = badge.getDateObtention();
        this.niveauCertification = badge.getNiveauCertification();
        this.validitePermanente = badge.getValiditePermanente();
        this.dateExpiration = badge.getDateExpiration();
        this.estActif = badge.getEstActif();
        this.dateRevocation = badge.getDateRevocation();
        this.motifRevocation = badge.getMotifRevocation();
        this.estPublic = badge.getEstPublic();
        this.ordreAffichage = badge.getOrdreAffichage();
        this.estValide = badge.estValide();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompetenceId() {
        return competenceId;
    }

    public void setCompetenceId(Long competenceId) {
        this.competenceId = competenceId;
    }

    public String getCompetenceNom() {
        return competenceNom;
    }

    public void setCompetenceNom(String competenceNom) {
        this.competenceNom = competenceNom;
    }

    public String getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public Long getDemandeReconnaissanceId() {
        return demandeReconnaissanceId;
    }

    public void setDemandeReconnaissanceId(Long demandeReconnaissanceId) {
        this.demandeReconnaissanceId = demandeReconnaissanceId;
    }

    public LocalDateTime getDateObtention() {
        return dateObtention;
    }

    public void setDateObtention(LocalDateTime dateObtention) {
        this.dateObtention = dateObtention;
    }

    public NiveauCertification getNiveauCertification() {
        return niveauCertification;
    }

    public void setNiveauCertification(NiveauCertification niveauCertification) {
        this.niveauCertification = niveauCertification;
    }

    public Boolean getValiditePermanente() {
        return validitePermanente;
    }

    public void setValiditePermanente(Boolean validitePermanente) {
        this.validitePermanente = validitePermanente;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDateTime dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public Boolean getEstActif() {
        return estActif;
    }

    public void setEstActif(Boolean estActif) {
        this.estActif = estActif;
    }

    public LocalDateTime getDateRevocation() {
        return dateRevocation;
    }

    public void setDateRevocation(LocalDateTime dateRevocation) {
        this.dateRevocation = dateRevocation;
    }

    public String getMotifRevocation() {
        return motifRevocation;
    }

    public void setMotifRevocation(String motifRevocation) {
        this.motifRevocation = motifRevocation;
    }

    public Boolean getEstPublic() {
        return estPublic;
    }

    public void setEstPublic(Boolean estPublic) {
        this.estPublic = estPublic;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public Boolean getEstValide() {
        return estValide;
    }

    public void setEstValide(Boolean estValide) {
        this.estValide = estValide;
    }
}
