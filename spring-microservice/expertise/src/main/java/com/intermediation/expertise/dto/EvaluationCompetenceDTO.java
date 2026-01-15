package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.EvaluationCompetence;
import com.intermediation.expertise.model.EvaluationCompetence.Recommandation;

import java.time.LocalDateTime;

/**
 * DTO pour les évaluations de compétence
 */
public class EvaluationCompetenceDTO {

    private Long id;
    private Long demandeId;
    private String traitantId;
    private Integer noteGlobale;
    private String criteres;
    private Recommandation recommandation;
    private String commentaire;
    private LocalDateTime dateEvaluation;
    private Integer tempsEvaluationMinutes;

    // Constructeurs
    public EvaluationCompetenceDTO() {}

    public EvaluationCompetenceDTO(EvaluationCompetence evaluation) {
        this.id = evaluation.getId();
        this.demandeId = evaluation.getDemandeId();
        this.traitantId = evaluation.getTraitantId();
        this.noteGlobale = evaluation.getNoteGlobale();
        this.criteres = evaluation.getCriteres();
        this.recommandation = evaluation.getRecommandation();
        this.commentaire = evaluation.getCommentaire();
        this.dateEvaluation = evaluation.getDateEvaluation();
        this.tempsEvaluationMinutes = evaluation.getTempsEvaluationMinutes();
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
}
