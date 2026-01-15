package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un critère d'évaluation spécifique à un domaine de compétence
 */
@Entity
@Table(name = "criteres_evaluation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CritereEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Domaine de compétence auquel appartient ce critère
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domaine_id", nullable = false)
    private DomaineCompetence domaine;

    /**
     * Méthodes d'évaluation associées à ce critère
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "criteres_methodes",
        joinColumns = @JoinColumn(name = "critere_id"),
        inverseJoinColumns = @JoinColumn(name = "methode_id")
    )
    private Set<MethodeEvaluation> methodes = new HashSet<>();

    /**
     * Code unique du critère dans le domaine
     */
    @Column(nullable = false, length = 50)
    private String code;

    /**
     * Libellé court du critère
     */
    @Column(nullable = false, length = 100)
    private String libelle;

    /**
     * Description détaillée du critère
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Critère actif ou inactif
     */
    @Column(name = "est_actif")
    private Boolean estActif = true;

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
