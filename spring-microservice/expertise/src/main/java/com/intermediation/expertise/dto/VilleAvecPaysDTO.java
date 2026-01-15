package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'autocomplete des villes avec leur pays
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VilleAvecPaysDTO {
    private Long villeId;
    private String nomVille;
    private Long paysId;
    private String nomPays;
    private String nomComplet; // "Paris, France"
    private Integer indicePopularite;
}
