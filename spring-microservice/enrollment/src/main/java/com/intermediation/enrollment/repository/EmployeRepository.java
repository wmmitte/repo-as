package com.intermediation.enrollment.repository;

import com.intermediation.enrollment.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 SONGRE-TECH, All rights reserved.
 * @since : 2025/07/03 à 12:33
 */
@Repository
public interface EmployeRepository extends JpaRepository<Employe, UUID> {
}
