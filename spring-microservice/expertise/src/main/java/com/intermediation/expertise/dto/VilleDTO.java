package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'entité Ville
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VilleDTO {
    private Long id;
    private String nom;
    private Long paysId;
    private String paysNom;
    private String codePostal;
    private Boolean estActif;
    private Integer indicePopularite;
}
