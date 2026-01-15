package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SousDomaineMetierDTO {
    private Long id;
    private Long domaineMetierId;
    private String code;
    private String libelle;
    private String description;
    private Integer popularite;
    private Boolean estActif;
}
