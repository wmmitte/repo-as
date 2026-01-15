package com.intermediation.enrollment.controller;

import com.intermediation.enrollment.entity.dto.EmployeDto;
import com.intermediation.enrollment.service.EmployeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

/**
 * @author :  <A HREF="mailto:dieudonneouedra@gmail.com">Dieudonné OUEDRAOGO (Wendkouny)</A>
 * @version : 1.0
 * Copyright (c) 2025 DGTCP, All rights reserved.
 * @since : 2025/07/03 à 12:44
 */
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeController {
    private final EmployeService employeService;

    @PostMapping
    public ResponseEntity<EmployeDto> save(@RequestBody EmployeDto employeDto) {
        return ResponseEntity.ok(employeService.save(employeDto));
    }

    @PutMapping
    public ResponseEntity<EmployeDto> update(@RequestBody EmployeDto employeDto) {
        return ResponseEntity.ok(employeService.save(employeDto));
    }

    @GetMapping("/is-salary-confirmed")
    public ResponseEntity<Boolean> isSalaryConfirmed(@RequestParam UUID employeId, @RequestParam Long salary) {
        return ResponseEntity.ok(employeService.isSalaryConfirmed(employeId, salary));
    }

    @GetMapping
    public ResponseEntity<List<EmployeDto>> findAll() {
        return ResponseEntity.ok(employeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeDto> getEmployeById(@PathVariable UUID id) {
        return ResponseEntity.ok(employeService.getEmployeById(id));
    }

}
