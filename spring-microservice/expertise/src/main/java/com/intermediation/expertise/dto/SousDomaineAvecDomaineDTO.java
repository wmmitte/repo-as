package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'autocomplete des sous-domaines avec leur domaine
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SousDomaineAvecDomaineDTO {
    private Long sousDomaineId;
    private String codeSousDomaine;
    private String libelleSousDomaine;
    private Long domaineId;
    private String libelleDomaine;
    private String nomComplet; // "Java (Développement)"
    private Integer popularite;
}
