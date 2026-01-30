package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.CommentaireTache;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO pour un commentaire sur une tâche.
 */
public class CommentaireTacheDTO {

    private Long id;
    private Long tacheId;
    private Long parentId;
    private String auteurId;
    private String contenu;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Réponses (pour structure hiérarchique)
    private List<CommentaireTacheDTO> reponses = new ArrayList<>();

    // Constructeurs
    public CommentaireTacheDTO() {}

    public CommentaireTacheDTO(CommentaireTache commentaire) {
        this.id = commentaire.getId();
        this.tacheId = commentaire.getTache() != null ? commentaire.getTache().getId() : null;
        this.parentId = commentaire.getParent() != null ? commentaire.getParent().getId() : null;
        this.auteurId = commentaire.getAuteurId();
        this.contenu = commentaire.getContenu();
        this.dateCreation = commentaire.getDateCreation();
        this.dateModification = commentaire.getDateModification();

        if (commentaire.getReponses() != null) {
            this.reponses = commentaire.getReponses().stream()
                    .map(CommentaireTacheDTO::new)
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

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getAuteurId() {
        return auteurId;
    }

    public void setAuteurId(String auteurId) {
        this.auteurId = auteurId;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
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

    public List<CommentaireTacheDTO> getReponses() {
        return reponses;
    }

    public void setReponses(List<CommentaireTacheDTO> reponses) {
        this.reponses = reponses;
    }
}
