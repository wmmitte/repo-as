package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MethodeEvaluationDTO {
    private Long id;
    private String code;
    private String libelle;
    private String description;
    private String typeMethode;
    private Boolean estActif;
}
