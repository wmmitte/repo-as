package com.intermediation.expertise.dto;

import java.util.Map;

/**
 * DTO pour les statistiques de traitement des demandes
 */
public class StatistiquesTraitementDTO {

    private Long totalDemandes;
    private Long demandesEnAttente;
    private Long demandesEnCours;
    private Long demandesApprouvees;
    private Long demandesRejetees;
    private Long demandesComplementRequis;
    
    private Map<String, Long> demandesParStatut;
    private Map<String, Long> demandesParTraitant;
    
    private Double tauxApprobation;
    private Double tempsTraitementMoyen;
    private Double noteMoyenne;
    
    private Long mesDemandesEnCours; // Pour un traitant spécifique
    private Long mesDemandesTraitees;

    // Constructeurs
    public StatistiquesTraitementDTO() {}

    // Getters et Setters
    public Long getTotalDemandes() {
        return totalDemandes;
    }

    public void setTotalDemandes(Long totalDemandes) {
        this.totalDemandes = totalDemandes;
    }

    public Long getDemandesEnAttente() {
        return demandesEnAttente;
    }

    public void setDemandesEnAttente(Long demandesEnAttente) {
        this.demandesEnAttente = demandesEnAttente;
    }

    public Long getDemandesEnCours() {
        return demandesEnCours;
    }

    public void setDemandesEnCours(Long demandesEnCours) {
        this.demandesEnCours = demandesEnCours;
    }

    public Long getDemandesApprouvees() {
        return demandesApprouvees;
    }

    public void setDemandesApprouvees(Long demandesApprouvees) {
        this.demandesApprouvees = demandesApprouvees;
    }

    public Long getDemandesRejetees() {
        return demandesRejetees;
    }

    public void setDemandesRejetees(Long demandesRejetees) {
        this.demandesRejetees = demandesRejetees;
    }

    public Long getDemandesComplementRequis() {
        return demandesComplementRequis;
    }

    public void setDemandesComplementRequis(Long demandesComplementRequis) {
        this.demandesComplementRequis = demandesComplementRequis;
    }

    public Map<String, Long> getDemandesParStatut() {
        return demandesParStatut;
    }

    public void setDemandesParStatut(Map<String, Long> demandesParStatut) {
        this.demandesParStatut = demandesParStatut;
    }

    public Map<String, Long> getDemandesParTraitant() {
        return demandesParTraitant;
    }

    public void setDemandesParTraitant(Map<String, Long> demandesParTraitant) {
        this.demandesParTraitant = demandesParTraitant;
    }

    public Double getTauxApprobation() {
        return tauxApprobation;
    }

    public void setTauxApprobation(Double tauxApprobation) {
        this.tauxApprobation = tauxApprobation;
    }

    public Double getTempsTraitementMoyen() {
        return tempsTraitementMoyen;
    }

    public void setTempsTraitementMoyen(Double tempsTraitementMoyen) {
        this.tempsTraitementMoyen = tempsTraitementMoyen;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Long getMesDemandesEnCours() {
        return mesDemandesEnCours;
    }

    public void setMesDemandesEnCours(Long mesDemandesEnCours) {
        this.mesDemandesEnCours = mesDemandesEnCours;
    }

    public Long getMesDemandesTraitees() {
        return mesDemandesTraitees;
    }

    public void setMesDemandesTraitees(Long mesDemandesTraitees) {
        this.mesDemandesTraitees = mesDemandesTraitees;
    }
}
