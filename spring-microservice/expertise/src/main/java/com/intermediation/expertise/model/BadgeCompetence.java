package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un badge de compétence attribué à un utilisateur
 * suite à une demande de reconnaissance approuvée
 * 
 * Note: La contrainte unique sur (competence_id, utilisateur_id) est définie
 * en SQL comme un index unique partiel (WHERE est_actif = true) pour permettre
 * l'historique des badges inactifs tout en garantissant un seul badge actif par compétence.
 */
@Entity
@Table(name = "badges_competence")
public class BadgeCompetence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "competence_id", nullable = false)
    private Long competenceId;

    @Column(name = "utilisateur_id", nullable = false)
    private String utilisateurId;

    @Column(name = "demande_reconnaissance_id")
    private Long demandeReconnaissanceId; // Référence à la demande d'origine

    @Column(name = "date_obtention", nullable = false)
    private LocalDateTime dateObtention;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_certification", nullable = false, length = 20)
    private NiveauCertification niveauCertification;

    @Column(name = "validite_permanente")
    private Boolean validitePermanente = true;

    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration; // Si validité limitée

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @Column(name = "date_revocation")
    private LocalDateTime dateRevocation;

    @Column(name = "motif_revocation", columnDefinition = "TEXT")
    private String motifRevocation;

    @Column(name = "revoque_par")
    private String revoquePar; // ID de l'admin qui a révoqué

    @Column(name = "est_public")
    private Boolean estPublic = true; // Badge visible publiquement sur le profil

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage = 0; // Pour trier les badges sur le profil

    // Constructeurs
    public BadgeCompetence() {
        this.dateObtention = LocalDateTime.now();
    }

    public BadgeCompetence(Long competenceId, String utilisateurId, 
                          NiveauCertification niveauCertification, Long demandeReconnaissanceId) {
        this();
        this.competenceId = competenceId;
        this.utilisateurId = utilisateurId;
        this.niveauCertification = niveauCertification;
        this.demandeReconnaissanceId = demandeReconnaissanceId;
    }

    // Méthodes métier
    public boolean estValide() {
        if (!estActif) {
            return false;
        }
        if (validitePermanente) {
            return true;
        }
        return dateExpiration != null && LocalDateTime.now().isBefore(dateExpiration);
    }

    public void revoquer(String motif, String revoquePar) {
        this.estActif = false;
        this.dateRevocation = LocalDateTime.now();
        this.motifRevocation = motif;
        this.revoquePar = revoquePar;
    }

    public void definirExpiration(LocalDateTime dateExpiration) {
        this.validitePermanente = false;
        this.dateExpiration = dateExpiration;
    }

    public void rendrePublic() {
        this.estPublic = true;
    }

    public void rendrePrive() {
        this.estPublic = false;
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

    public String getRevoquePar() {
        return revoquePar;
    }

    public void setRevoquePar(String revoquePar) {
        this.revoquePar = revoquePar;
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

    /**
     * Niveau de certification du badge
     */
    public enum NiveauCertification {
        BRONZE(1, "Bronze - Niveau débutant"),
        ARGENT(2, "Argent - Niveau intermédiaire"),
        OR(3, "Or - Niveau avancé"),
        PLATINE(4, "Platine - Niveau expert");

        private final int niveau;
        private final String description;

        NiveauCertification(int niveau, String description) {
            this.niveau = niveau;
            this.description = description;
        }

        public int getNiveau() {
            return niveau;
        }

        public String getDescription() {
            return description;
        }
    }
}
