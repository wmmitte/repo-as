package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un commentaire/discussion sur une tâche.
 */
@Entity
@Table(name = "commentaires_tache")
public class CommentaireTache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tache_id", nullable = false)
    private TacheProjet tache;

    @Column(name = "auteur_id", nullable = false)
    private String auteurId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommentaireTache parent; // Pour les réponses

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentaireTache> reponses = new ArrayList<>();

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Constructeurs
    public CommentaireTache() {
        this.dateCreation = LocalDateTime.now();
    }

    public CommentaireTache(TacheProjet tache, String auteurId, String contenu) {
        this.tache = tache;
        this.auteurId = auteurId;
        this.contenu = contenu;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void ajouterReponse(CommentaireTache reponse) {
        reponses.add(reponse);
        reponse.setParent(this);
    }

    public boolean estReponse() {
        return parent != null;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TacheProjet getTache() {
        return tache;
    }

    public void setTache(TacheProjet tache) {
        this.tache = tache;
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

    public CommentaireTache getParent() {
        return parent;
    }

    public void setParent(CommentaireTache parent) {
        this.parent = parent;
    }

    public List<CommentaireTache> getReponses() {
        return reponses;
    }

    public void setReponses(List<CommentaireTache> reponses) {
        this.reponses = reponses;
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
}
