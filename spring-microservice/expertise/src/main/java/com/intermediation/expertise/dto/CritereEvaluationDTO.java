package com.intermediation.expertise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CritereEvaluationDTO {
    private Long id;
    private Long domaineId;
    private String code;
    private String libelle;
    private String description;
    private Boolean estActif;
    private Set<Long> methodeIds;
}
