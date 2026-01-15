package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.EvaluationCompetence.Recommandation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO pour évaluer une demande de reconnaissance
 */
public class EvaluationRequest {

    @NotNull(message = "La recommandation est obligatoire")
    private Recommandation recommandation;

    @NotBlank(message = "Le commentaire est obligatoire")
    private String commentaire;

    private Integer tempsEvaluationMinutes;

    private String criteres; // JSON avec critères détaillés

    private Integer noteGlobale; // Note globale sur 100

    // Constructeurs
    public EvaluationRequest() {}

    // Getters et Setters
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

    public Integer getTempsEvaluationMinutes() {
        return tempsEvaluationMinutes;
    }

    public void setTempsEvaluationMinutes(Integer tempsEvaluationMinutes) {
        this.tempsEvaluationMinutes = tempsEvaluationMinutes;
    }

    public String getCriteres() {
        return criteres;
    }

    public void setCriteres(String criteres) {
        this.criteres = criteres;
    }

    public Integer getNoteGlobale() {
        return noteGlobale;
    }

    public void setNoteGlobale(Integer noteGlobale) {
        this.noteGlobale = noteGlobale;
    }
}
