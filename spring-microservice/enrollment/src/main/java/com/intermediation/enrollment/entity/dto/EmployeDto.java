package com.intermediation.enrollment.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.util.UUID;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 DGTCP, All rights reserved.
 * @since : 2025/07/03 à 12:00
 */

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeDto implements Serializable {

    private UUID id;

    private String nom;

    private String prenom;

    private String email;

    private String adresse;

    private Long salaire;
}
