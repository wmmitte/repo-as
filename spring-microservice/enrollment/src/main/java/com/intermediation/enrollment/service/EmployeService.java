package com.intermediation.enrollment.service;

import com.intermediation.enrollment.entity.Employe;
import com.intermediation.enrollment.entity.dto.EmployeDto;
import com.intermediation.enrollment.repository.EmployeRepository;
import com.intermediation.enrollment.service.mapper.EmployeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 SONGRE-TECH, All rights reserved.
 * @since : 2025/07/03 à 12:32
 */

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeService {
    private final EmployeRepository employeRepository;
    private final EmployeMapper employeMapper;

    public EmployeDto save(EmployeDto employeDto) {
        Employe employe = employeMapper.toEntity(employeDto);
        return employeMapper.toDto(employeRepository.save(employe));
    }

    public List<EmployeDto> findAll() {
        return employeRepository.findAll()
                .stream()
                .map(employeMapper::toDto)
                .toList();
    }

    public EmployeDto getEmployeById(UUID id) {
        log.info("getEmployeById: {}", id);
        return employeMapper.toDto(employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employe not found")));
    }

    public boolean isSalaryConfirmed(UUID employeId, Long salary) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employe not found"));

        return employe.getSalaire().equals(salary);
    }
}
