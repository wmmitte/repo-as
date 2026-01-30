package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un livrable attendu pour une tâche.
 */
@Entity
@Table(name = "livrables_tache")
public class LivrableTache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tache_id", nullable = false)
    private TacheProjet tache;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatutLivrable statut = StatutLivrable.A_FOURNIR;

    // Fichier soumis
    @Column(name = "fichier_url", length = 500)
    private String fichierUrl;

    @Column(name = "fichier_nom", length = 255)
    private String fichierNom;

    @Column(name = "fichier_taille")
    private Long fichierTaille;

    @Column(name = "fichier_type", length = 100)
    private String fichierType;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "commentaire_soumission", columnDefinition = "TEXT")
    private String commentaireSoumission;

    // Validation
    @Column(name = "valide_par_id")
    private String valideParId;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "commentaire_validation", columnDefinition = "TEXT")
    private String commentaireValidation;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Relations
    @OneToMany(mappedBy = "livrable", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<CritereAcceptationLivrable> criteres = new ArrayList<>();

    // Enum
    public enum StatutLivrable {
        A_FOURNIR, SOUMIS, EN_REVUE, ACCEPTE, REFUSE, A_REVISER
    }

    // Constructeurs
    public LivrableTache() {
        this.dateCreation = LocalDateTime.now();
    }

    public LivrableTache(TacheProjet tache, String nom) {
        this.tache = tache;
        this.nom = nom;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void ajouterCritere(CritereAcceptationLivrable critere) {
        criteres.add(critere);
        critere.setLivrable(this);
    }

    public void soumettre(String fichierUrl, String fichierNom, Long taille, String type, String commentaire) {
        this.fichierUrl = fichierUrl;
        this.fichierNom = fichierNom;
        this.fichierTaille = taille;
        this.fichierType = type;
        this.commentaireSoumission = commentaire;
        this.dateSoumission = LocalDateTime.now();
        this.statut = StatutLivrable.SOUMIS;
    }

    public void valider(String validateurId, boolean accepte, String commentaire) {
        this.valideParId = validateurId;
        this.dateValidation = LocalDateTime.now();
        this.commentaireValidation = commentaire;
        this.statut = accepte ? StatutLivrable.ACCEPTE : StatutLivrable.REFUSE;
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

    public StatutLivrable getStatut() {
        return statut;
    }

    public void setStatut(StatutLivrable statut) {
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

    public List<CritereAcceptationLivrable> getCriteres() {
        return criteres;
    }

    public void setCriteres(List<CritereAcceptationLivrable> criteres) {
        this.criteres = criteres;
    }
}
