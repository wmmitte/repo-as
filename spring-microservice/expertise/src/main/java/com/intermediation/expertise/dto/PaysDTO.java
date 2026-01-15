package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'entité Pays
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaysDTO {
    private Long id;
    private String nom;
    private String codeIso;
    private Boolean estActif;
    private Integer indicePopularite;
    private Integer nombreVilles; // Calculé
}
