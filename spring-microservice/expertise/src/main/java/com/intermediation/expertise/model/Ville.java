package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité représentant une ville
 */
@Entity
@Table(name = "villes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nom", "pays_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ville {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nom;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pays_id", nullable = false)
    private Pays pays;
    
    @Column(name = "code_postal", length = 20)
    private String codePostal;
    
    @Column(name = "est_actif")
    private Boolean estActif = true;
    
    @Column(name = "indice_popularite")
    private Integer indicePopularite = 0;
    
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
    
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
