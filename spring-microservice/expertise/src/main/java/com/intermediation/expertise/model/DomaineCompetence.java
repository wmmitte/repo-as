package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant un domaine de compétence selon la classification pédagogique
 * SAVOIR, SAVOIR_FAIRE, SAVOIR_ETRE, SAVOIR_AGIR
 */
@Entity
@Table(name = "domaines_competence")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomaineCompetence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Code unique du domaine (SAVOIR, SAVOIR_FAIRE, SAVOIR_ETRE, SAVOIR_AGIR)
     */
    @Column(unique = true, nullable = false, length = 20)
    private String code;

    /**
     * Libellé du domaine
     */
    @Column(nullable = false, length = 100)
    private String libelle;

    /**
     * Description détaillée du domaine
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Ordre d'affichage
     */
    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;

    /**
     * Domaine actif ou inactif
     */
    @Column(name = "est_actif")
    private Boolean estActif = true;

    /**
     * Critères d'évaluation associés à ce domaine
     */
    @OneToMany(mappedBy = "domaine", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CritereEvaluation> criteres;

    /**
     * Compétences de référence utilisant ce domaine
     */
    @OneToMany(mappedBy = "domaineCompetence", fetch = FetchType.LAZY)
    private List<CompetenceReference> competences;

    /**
     * Date de création
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date de dernière mise à jour
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
