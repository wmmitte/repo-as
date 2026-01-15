package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité représentant un sous-domaine métier
 */
@Entity
@Table(name = "sous_domaines_metier", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"domaine_metier_id", "code"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SousDomaineMetier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "domaine_metier_id", nullable = false)
    private DomaineMetier domaineMetier;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String libelle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "popularite")
    private Integer popularite;

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

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
