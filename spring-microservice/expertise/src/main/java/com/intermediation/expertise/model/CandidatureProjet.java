package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité représentant une candidature d'un expert sur un projet ou une tâche.
 */
@Entity
@Table(name = "candidatures_projet")
public class CandidatureProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tache_id")
    private TacheProjet tache; // Nullable - si null, candidature sur le projet entier

    @Column(name = "expert_id", nullable = false)
    private UUID expertId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "tarif_propose", precision = 15, scale = 2)
    private BigDecimal tarifPropose;

    @Column(name = "delai_propose_jours")
    private Integer delaiProposeJours;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    @Column(name = "reponse_client", columnDefinition = "TEXT")
    private String reponseClient;

    @Column(name = "date_reponse")
    private LocalDateTime dateReponse;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Enum
    public enum StatutCandidature {
        EN_ATTENTE, EN_DISCUSSION, ACCEPTEE, REFUSEE, RETIREE
    }

    // Constructeurs
    public CandidatureProjet() {
        this.dateCreation = LocalDateTime.now();
    }

    public CandidatureProjet(Projet projet, UUID expertId) {
        this.projet = projet;
        this.expertId = expertId;
        this.dateCreation = LocalDateTime.now();
    }

    public CandidatureProjet(Projet projet, TacheProjet tache, UUID expertId) {
        this.projet = projet;
        this.tache = tache;
        this.expertId = expertId;
        this.dateCreation = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void accepter(String reponse) {
        this.statut = StatutCandidature.ACCEPTEE;
        this.reponseClient = reponse;
        this.dateReponse = LocalDateTime.now();
    }

    public void refuser(String reponse) {
        this.statut = StatutCandidature.REFUSEE;
        this.reponseClient = reponse;
        this.dateReponse = LocalDateTime.now();
    }

    public void retirer() {
        this.statut = StatutCandidature.RETIREE;
    }

    public boolean estSurTache() {
        return tache != null;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public TacheProjet getTache() {
        return tache;
    }

    public void setTache(TacheProjet tache) {
        this.tache = tache;
    }

    public UUID getExpertId() {
        return expertId;
    }

    public void setExpertId(UUID expertId) {
        this.expertId = expertId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getTarifPropose() {
        return tarifPropose;
    }

    public void setTarifPropose(BigDecimal tarifPropose) {
        this.tarifPropose = tarifPropose;
    }

    public Integer getDelaiProposeJours() {
        return delaiProposeJours;
    }

    public void setDelaiProposeJours(Integer delaiProposeJours) {
        this.delaiProposeJours = delaiProposeJours;
    }

    public StatutCandidature getStatut() {
        return statut;
    }

    public void setStatut(StatutCandidature statut) {
        this.statut = statut;
    }

    public String getReponseClient() {
        return reponseClient;
    }

    public void setReponseClient(String reponseClient) {
        this.reponseClient = reponseClient;
    }

    public LocalDateTime getDateReponse() {
        return dateReponse;
    }

    public void setDateReponse(LocalDateTime dateReponse) {
        this.dateReponse = dateReponse;
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
