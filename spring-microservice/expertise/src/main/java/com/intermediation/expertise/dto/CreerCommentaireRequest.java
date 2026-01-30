package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request pour créer un commentaire sur une tâche.
 */
public class CreerCommentaireRequest {

    @NotNull(message = "L'ID de la tâche est obligatoire")
    private Long tacheId;

    private Long parentId; // Nullable - si null, commentaire racine

    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    private String contenu;

    // Constructeurs
    public CreerCommentaireRequest() {}

    // Getters et Setters
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

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }
}
