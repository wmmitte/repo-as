package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reseau_expertises", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"utilisateur_id", "expert_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReseauExpertise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "utilisateur_id", nullable = false)
    private String utilisateurId; // ID de l'utilisateur
    
    @Column(name = "expert_id", nullable = false)
    private String expertId; // ID de l'expert dans le réseau
    
    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout;
    
    @PrePersist
    protected void onCreate() {
        dateAjout = LocalDateTime.now();
    }
}
