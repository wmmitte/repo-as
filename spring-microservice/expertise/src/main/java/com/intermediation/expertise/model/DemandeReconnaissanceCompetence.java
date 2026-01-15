package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une demande de reconnaissance de compétence
 * soumise par un expert pour validation
 */
@Entity
@Table(name = "demandes_reconnaissance_competence")
public class DemandeReconnaissanceCompetence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private String utilisateurId; // Expert qui soumet la demande

    @Column(name = "competence_id", nullable = false)
    private Long competenceId; // Compétence concernée

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_derniere_modification")
    private LocalDateTime dateDerniereModification;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "traitant_id")
    private String traitantId; // ID du RH assigné

    @Column(name = "manager_id")
    private String managerId; // ID du manager qui a assigné

    @Column(name = "date_assignation")
    private LocalDateTime dateAssignation; // Date d'assignation au RH

    @Column(name = "date_evaluation")
    private LocalDateTime dateEvaluation; // Date de soumission de l'évaluation au Manager

    @Column(name = "commentaire_expert", columnDefinition = "TEXT")
    private String commentaireExpert; // Justification de l'expert

    @Column(name = "commentaire_manager_assignation", columnDefinition = "TEXT")
    private String commentaireManagerAssignation; // Instructions du Manager au RH (visible uniquement par le RH)

    @Column(name = "commentaire_rh_evaluation", columnDefinition = "TEXT")
    private String commentaireRhEvaluation; // Commentaire du RH lors de l'évaluation (visible par le Manager, pas par l'expert)

    @Column(name = "commentaire_traitant", columnDefinition = "TEXT")
    private String commentaireTraitant; // Commentaire final du Manager lors de l'approbation/rejet (visible par l'expert)

    @Column(name = "preuves", columnDefinition = "TEXT")
    private String preuves; // JSON avec métadonnées des preuves

    @Column(name = "priorite")
    private Integer priorite = 0; // 0 = normale, 1 = haute, etc.

    @Column(name = "process_instance_key")
    private Long processInstanceKey; // Clé de l'instance du processus BPMN Zeebe

    // Constructeurs
    public DemandeReconnaissanceCompetence() {
        this.dateCreation = LocalDateTime.now();
    }

    public DemandeReconnaissanceCompetence(String utilisateurId, Long competenceId) {
        this();
        this.utilisateurId = utilisateurId;
        this.competenceId = competenceId;
    }

    // Méthodes métier

    /**
     * Assigner une demande à un RH (par un Manager)
     */
    public void assignerAuRh(String managerId, String rhId, String commentaireAssignation) {
        this.managerId = managerId;
        this.traitantId = rhId;
        this.commentaireManagerAssignation = commentaireAssignation;
        this.dateAssignation = LocalDateTime.now();
        this.statut = StatutDemande.ASSIGNEE_RH;
        this.dateDerniereModification = LocalDateTime.now();
    }

    /**
     * Le RH commence l'évaluation
     */
    public void demarrerEvaluation() {
        if (this.statut != StatutDemande.ASSIGNEE_RH) {
            throw new IllegalStateException("La demande doit être assignée pour démarrer l'évaluation");
        }
        this.statut = StatutDemande.EN_COURS_EVALUATION;
        this.dateDerniereModification = LocalDateTime.now();
    }

    /**
     * Le RH soumet l'évaluation au Manager
     */
    public void soumettreAuManager() {
        if (this.statut != StatutDemande.EN_COURS_EVALUATION && this.statut != StatutDemande.ASSIGNEE_RH) {
            throw new IllegalStateException("La demande doit être en cours d'évaluation pour être soumise");
        }
        this.dateEvaluation = LocalDateTime.now();
        this.statut = StatutDemande.EN_ATTENTE_VALIDATION;
        this.dateDerniereModification = LocalDateTime.now();
    }

    /**
     * Méthode legacy pour compatibilité
     * @deprecated Utiliser assignerAuRh à la place
     */
    @Deprecated
    public void assigner(String traitantId) {
        this.traitantId = traitantId;
        this.statut = StatutDemande.EN_COURS_TRAITEMENT;
        this.dateDerniereModification = LocalDateTime.now();
    }

    public void approuver(String commentaire) {
        this.statut = StatutDemande.APPROUVEE;
        this.commentaireTraitant = commentaire;
        this.dateTraitement = LocalDateTime.now();
        this.dateDerniereModification = LocalDateTime.now();
    }

    public void rejeter(String motif) {
        this.statut = StatutDemande.REJETEE;
        this.commentaireTraitant = motif;
        this.dateTraitement = LocalDateTime.now();
        this.dateDerniereModification = LocalDateTime.now();
    }

    public void demanderComplement(String commentaire) {
        this.statut = StatutDemande.COMPLEMENT_REQUIS;
        this.commentaireTraitant = commentaire;
        this.dateDerniereModification = LocalDateTime.now();
    }

    public void annuler() {
        this.statut = StatutDemande.ANNULEE;
        this.dateDerniereModification = LocalDateTime.now();
    }

    public void resoumettreApresComplement() {
        // Retour au même RH qui avait évalué
        if (this.traitantId != null) {
            this.statut = StatutDemande.ASSIGNEE_RH;
        } else {
            this.statut = StatutDemande.EN_ATTENTE;
        }
        this.dateDerniereModification = LocalDateTime.now();
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

    public String getPreuves() {
        return preuves;
    }

    public void setPreuves(String preuves) {
        this.preuves = preuves;
    }

    public Integer getPriorite() {
        return priorite;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    public Long getProcessInstanceKey() {
        return processInstanceKey;
    }

    public void setProcessInstanceKey(Long processInstanceKey) {
        this.processInstanceKey = processInstanceKey;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public LocalDateTime getDateAssignation() {
        return dateAssignation;
    }

    public void setDateAssignation(LocalDateTime dateAssignation) {
        this.dateAssignation = dateAssignation;
    }

    public LocalDateTime getDateEvaluation() {
        return dateEvaluation;
    }

    public void setDateEvaluation(LocalDateTime dateEvaluation) {
        this.dateEvaluation = dateEvaluation;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateDerniereModification = LocalDateTime.now();
    }

    /**
     * Statut d'une demande de reconnaissance
     */
    public enum StatutDemande {
        EN_ATTENTE("En attente d'assignation"),
        ASSIGNEE_RH("Assignée à un RH"),
        EN_COURS_EVALUATION("En cours d'évaluation par le RH"),
        EN_ATTENTE_VALIDATION("En attente de validation Manager"),
        COMPLEMENT_REQUIS("Complément d'information requis"),
        APPROUVEE("Approuvée"),
        REJETEE("Rejetée"),
        ANNULEE("Annulée par l'expert"),
        // Ancien statut conservé pour compatibilité
        @Deprecated
        EN_COURS_TRAITEMENT("En cours de traitement");

        private final String description;

        StatutDemande(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Niveau de certification visé
     */
    public enum NiveauCertification {
        BRONZE("Bronze - Niveau débutant"),
        ARGENT("Argent - Niveau intermédiaire"),
        OR("Or - Niveau avancé"),
        PLATINE("Platine - Niveau expert");

        private final String description;

        NiveauCertification(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
