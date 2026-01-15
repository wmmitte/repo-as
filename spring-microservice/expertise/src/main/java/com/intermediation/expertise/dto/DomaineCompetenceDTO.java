package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomaineCompetenceDTO {
    private Long id;
    private String code;
    private String libelle;
    private String description;
    private Integer ordreAffichage;
    private Boolean estActif;
}
