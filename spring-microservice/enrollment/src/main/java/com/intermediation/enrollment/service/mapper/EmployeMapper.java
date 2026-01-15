package com.intermediation.enrollment.service.mapper;

import com.intermediation.enrollment.entity.Employe;
import com.intermediation.enrollment.entity.dto.EmployeDto;
import org.springframework.stereotype.Component;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 DGTCP, All rights reserved.
 * @since : 2025/07/03 à 12:35
 */

@Component
public class EmployeMapper {

    public EmployeDto toDto(Employe employe) {
        return EmployeDto.builder()
                .id(employe.getId())
                .nom(employe.getNom())
                .prenom(employe.getPrenom())
                .email(employe.getEmail())
                .adresse(employe.getAdresse())
                .salaire(employe.getSalaire())
                .build();
    }

    public Employe toEntity(EmployeDto employeDto) {
        return Employe.builder()
                .id(employeDto.getId())
                .nom(employeDto.getNom())
                .prenom(employeDto.getPrenom())
                .email(employeDto.getEmail())
                .adresse(employeDto.getAdresse())
                .salaire(employeDto.getSalaire())
                .build();
    }
}
