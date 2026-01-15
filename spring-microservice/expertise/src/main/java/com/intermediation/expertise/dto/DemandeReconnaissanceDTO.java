package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.DemandeReconnaissanceCompetence;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour les demandes de reconnaissance de compétence
 */
public class DemandeReconnaissanceDTO {

    private Long id;
    private String utilisateurId;
    private Long competenceId;
    private Long competenceReferenceId; // ID de la compétence de référence pour charger les critères
    private String competenceNom; // Nom de la compétence
    private StatutDemande statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDerniereModification;
    private LocalDateTime dateTraitement;
    private String traitantId;
    private String traitantNom; // Nom complet du RH assigné (prénom + nom)
    private String commentaireExpert;
    private String commentaireManagerAssignation; // Instructions du Manager au RH (visible uniquement par le RH)
    private String commentaireRhEvaluation; // Commentaire du RH lors de l'évaluation (visible par le Manager, pas par l'expert)
    private String commentaireTraitant; // Commentaire final du Manager (visible par l'expert)
    private Integer priorite;
    private String niveauDetermine; // Niveau déterminé automatiquement basé sur le domaine de compétence (SAVOIR, SAVOIR_FAIRE, etc.)

    // Informations enrichies
    private List<PieceJustificativeDTO> pieces;
    private EvaluationCompetenceDTO evaluation;
    private Integer nombrePieces;
    private BadgeCompetenceDTO badge;

    // Constructeurs
    public DemandeReconnaissanceDTO() {}

    public DemandeReconnaissanceDTO(DemandeReconnaissanceCompetence demande) {
        this.id = demande.getId();
        this.utilisateurId = demande.getUtilisateurId();
        this.competenceId = demande.getCompetenceId();
        this.statut = demande.getStatut();
        this.dateCreation = demande.getDateCreation();
        this.dateDerniereModification = demande.getDateDerniereModification();
        this.dateTraitement = demande.getDateTraitement();
        this.traitantId = demande.getTraitantId();
        this.commentaireExpert = demande.getCommentaireExpert();
        this.commentaireManagerAssignation = demande.getCommentaireManagerAssignation();
        this.commentaireRhEvaluation = demande.getCommentaireRhEvaluation();
        this.commentaireTraitant = demande.getCommentaireTraitant();
        this.priorite = demande.getPriorite();
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

    public Long getCompetenceReferenceId() {
        return competenceReferenceId;
    }

    public void setCompetenceReferenceId(Long competenceReferenceId) {
        this.competenceReferenceId = competenceReferenceId;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateDerniereModification() {
        return dateDerniereModification;
    }

    public void setDateDerniereModification(LocalDateTime dateDerniereModification) {
        this.dateDerniereModification = dateDerniereModification;
    }

    public LocalDateTime getDateTraitement() {
        return dateTraitement;
    }

    public void setDateTraitement(LocalDateTime dateTraitement) {
        this.dateTraitement = dateTraitement;
    }

    public String getTraitantId() {
        return traitantId;
    }

    public void setTraitantId(String traitantId) {
        this.traitantId = traitantId;
    }

    public String getTraitantNom() {
        return traitantNom;
    }

    public void setTraitantNom(String traitantNom) {
        this.traitantNom = traitantNom;
    }

    public String getCommentaireExpert() {
        return commentaireExpert;
    }

    public void setCommentaireExpert(String commentaireExpert) {
        this.commentaireExpert = commentaireExpert;
    }

    public String getCommentaireTraitant() {
        return commentaireTraitant;
    }

    public void setCommentaireTraitant(String commentaireTraitant) {
        this.commentaireTraitant = commentaireTraitant;
    }

    public String getCommentaireManagerAssignation() {
        return commentaireManagerAssignation;
    }

    public void setCommentaireManagerAssignation(String commentaireManagerAssignation) {
        this.commentaireManagerAssignation = commentaireManagerAssignation;
    }

    public String getCommentaireRhEvaluation() {
        return commentaireRhEvaluation;
    }

    public void setCommentaireRhEvaluation(String commentaireRhEvaluation) {
        this.commentaireRhEvaluation = commentaireRhEvaluation;
    }

    public Integer getPriorite() {
        return priorite;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    public String getNiveauDetermine() {
        return niveauDetermine;
    }

    public void setNiveauDetermine(String niveauDetermine) {
        this.niveauDetermine = niveauDetermine;
    }

    public List<PieceJustificativeDTO> getPieces() {
        return pieces;
    }

    public void setPieces(List<PieceJustificativeDTO> pieces) {
        this.pieces = pieces;
    }

    public EvaluationCompetenceDTO getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(EvaluationCompetenceDTO evaluation) {
        this.evaluation = evaluation;
    }

    public Integer getNombrePieces() {
        return nombrePieces;
    }

    public void setNombrePieces(Integer nombrePieces) {
        this.nombrePieces = nombrePieces;
    }

    public BadgeCompetenceDTO getBadge() {
        return badge;
    }

    public void setBadge(BadgeCompetenceDTO badge) {
        this.badge = badge;
    }
}
