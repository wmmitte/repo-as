package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.LivrableTache;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO pour un livrable de tâche.
 */
public class LivrableTacheDTO {

    private Long id;
    private Long tacheId;
    private String tacheNom;
    private String nom;
    private String description;
    private String statut;

    // Fichier soumis
    private String fichierUrl;
    private String fichierNom;
    private Long fichierTaille;
    private String fichierType;
    private LocalDateTime dateSoumission;
    private String commentaireSoumission;

    // Validation
    private String valideParId;
    private LocalDateTime dateValidation;
    private String commentaireValidation;

    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Critères d'acceptation
    private List<CritereAcceptationDTO> criteres = new ArrayList<>();

    // Constructeurs
    public LivrableTacheDTO() {}

    public LivrableTacheDTO(LivrableTache livrable) {
        this.id = livrable.getId();
        this.tacheId = livrable.getTache() != null ? livrable.getTache().getId() : null;
        this.tacheNom = livrable.getTache() != null ? livrable.getTache().getNom() : null;
        this.nom = livrable.getNom();
        this.description = livrable.getDescription();
        this.statut = livrable.getStatut() != null ? livrable.getStatut().name() : null;
        this.fichierUrl = livrable.getFichierUrl();
        this.fichierNom = livrable.getFichierNom();
        this.fichierTaille = livrable.getFichierTaille();
        this.fichierType = livrable.getFichierType();
        this.dateSoumission = livrable.getDateSoumission();
        this.commentaireSoumission = livrable.getCommentaireSoumission();
        this.valideParId = livrable.getValideParId();
        this.dateValidation = livrable.getDateValidation();
        this.commentaireValidation = livrable.getCommentaireValidation();
        this.dateCreation = livrable.getDateCreation();
        this.dateModification = livrable.getDateModification();

        if (livrable.getCriteres() != null) {
            this.criteres = livrable.getCriteres().stream()
                    .map(CritereAcceptationDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTacheId() {
        return tacheId;
    }

    public void setTacheId(Long tacheId) {
        this.tacheId = tacheId;
    }

    public String getTacheNom() {
        return tacheNom;
    }

    public void setTacheNom(String tacheNom) {
        this.tacheNom = tacheNom;
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getFichierUrl() {
        return fichierUrl;
    }

    public void setFichierUrl(String fichierUrl) {
        this.fichierUrl = fichierUrl;
    }

    public String getFichierNom() {
        return fichierNom;
    }

    public void setFichierNom(String fichierNom) {
        this.fichierNom = fichierNom;
    }

    public Long getFichierTaille() {
        return fichierTaille;
    }

    public void setFichierTaille(Long fichierTaille) {
        this.fichierTaille = fichierTaille;
    }

    public String getFichierType() {
        return fichierType;
    }

    public void setFichierType(String fichierType) {
        this.fichierType = fichierType;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public String getCommentaireSoumission() {
        return commentaireSoumission;
    }

    public void setCommentaireSoumission(String commentaireSoumission) {
        this.commentaireSoumission = commentaireSoumission;
    }

    public String getValideParId() {
        return valideParId;
    }

    public void setValideParId(String valideParId) {
        this.valideParId = valideParId;
    }

    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public void setDateValidation(LocalDateTime dateValidation) {
        this.dateValidation = dateValidation;
    }

    public String getCommentaireValidation() {
        return commentaireValidation;
    }

    public void setCommentaireValidation(String commentaireValidation) {
        this.commentaireValidation = commentaireValidation;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public List<CritereAcceptationDTO> getCriteres() {
        return criteres;
    }

    public void setCriteres(List<CritereAcceptationDTO> criteres) {
        this.criteres = criteres;
    }
}
