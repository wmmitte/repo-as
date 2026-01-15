package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entité représentant une méthode d'évaluation générique
 * Les méthodes seront associées aux critères d'évaluation via une table de liaison
 */
@Entity
@Table(name = "methodes_evaluation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MethodeEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Code unique de la méthode
     */
    @Column(nullable = false, length = 50, unique = true)
    private String code;

    /**
     * Libellé court de la méthode
     */
    @Column(nullable = false, length = 100)
    private String libelle;

    /**
     * Description détaillée de la méthode
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Type de méthode (THEORIQUE, PRATIQUE, COMPORTEMENTAL, INTEGRE)
     */
    @Column(name = "type_methode", length = 50)
    private String typeMethode;

    /**
     * Méthode active ou inactive
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
