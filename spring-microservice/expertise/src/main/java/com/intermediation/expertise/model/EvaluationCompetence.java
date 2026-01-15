package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant l'évaluation d'une demande de reconnaissance par un traitant
 */
@Entity
@Table(name = "evaluations_competence")
public class EvaluationCompetence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "demande_id", nullable = false)
    private Long demandeId;

    @Column(name = "traitant_id", nullable = false)
    private String traitantId;

    @Column(name = "note_globale")
    private Integer noteGlobale; // Note sur 100

    @Column(columnDefinition = "TEXT")
    private String criteres; // JSON avec détails des critères évalués

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Recommandation recommandation;

    @Column(columnDefinition = "TEXT")
    private String commentaire; // Commentaire détaillé du traitant

    @Column(name = "date_evaluation", nullable = false)
    private LocalDateTime dateEvaluation;

    @Column(name = "temps_evaluation_minutes")
    private Integer tempsEvaluationMinutes; // Durée de l'évaluation

    // Constructeurs
    public EvaluationCompetence() {
        this.dateEvaluation = LocalDateTime.now();
    }

    public EvaluationCompetence(Long demandeId, String traitantId, Recommandation recommandation) {
        this();
        this.demandeId = demandeId;
        this.traitantId = traitantId;
        this.recommandation = recommandation;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDemandeId() {
        return demandeId;
    }

    public void setDemandeId(Long demandeId) {
        this.demandeId = demandeId;
    }

    public String getTraitantId() {
        return traitantId;
    }

    public void setTraitantId(String traitantId) {
        this.traitantId = traitantId;
    }

    public Integer getNoteGlobale() {
        return noteGlobale;
    }

    public void setNoteGlobale(Integer noteGlobale) {
        this.noteGlobale = noteGlobale;
    }

    public String getCriteres() {
        return criteres;
    }

    public void setCriteres(String criteres) {
        this.criteres = criteres;
    }

    public Recommandation getRecommandation() {
        return recommandation;
    }

    public void setRecommandation(Recommandation recommandation) {
        this.recommandation = recommandation;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public LocalDateTime getDateEvaluation() {
        return dateEvaluation;
    }

    public void setDateEvaluation(LocalDateTime dateEvaluation) {
        this.dateEvaluation = dateEvaluation;
    }

    public Integer getTempsEvaluationMinutes() {
        return tempsEvaluationMinutes;
    }

    public void setTempsEvaluationMinutes(Integer tempsEvaluationMinutes) {
        this.tempsEvaluationMinutes = tempsEvaluationMinutes;
    }

    /**
     * Recommandation du traitant
     */
    public enum Recommandation {
        APPROUVER("Approuver la demande"),
        REJETER("Rejeter la demande"),
        DEMANDER_COMPLEMENT("Demander des compléments d'information"),
        EN_COURS("Évaluation en cours");

        private final String description;

        Recommandation(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
