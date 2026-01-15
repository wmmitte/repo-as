package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'entité DomaineMetier
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomaineMetierDTO {
    private Long id;
    private String code;
    private String libelle;
    private String description;
    private String icone;
    private String couleur;
    private Integer popularite;
    private Boolean estActif;
    private Integer nombreSousDomaines; // Calculé

    /**
     * Constructeur sans nombreSousDomaines (pour compatibilité avec ReferentielService)
     */
    public DomaineMetierDTO(Long id, String code, String libelle, String description,
                           String icone, String couleur, Integer popularite, Boolean estActif) {
        this.id = id;
        this.code = code;
        this.libelle = libelle;
        this.description = description;
        this.icone = icone;
        this.couleur = couleur;
        this.popularite = popularite;
        this.estActif = estActif;
        this.nombreSousDomaines = null;
    }
}
