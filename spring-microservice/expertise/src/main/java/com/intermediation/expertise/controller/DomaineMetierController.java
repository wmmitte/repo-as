package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.DomaineMetierDTO;
import com.intermediation.expertise.dto.SousDomaineAvecDomaineDTO;
import com.intermediation.expertise.service.DomaineMetierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des domaines métier et sous-domaines
 */
@RestController
@RequestMapping("/api/domaines-metier")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DomaineMetierController {

    private final DomaineMetierService service;

    // ==================== DOMAINES MÉTIER ====================

    @GetMapping
    public ResponseEntity<List<DomaineMetierDTO>> getAllDomaines() {
        return ResponseEntity.ok(service.getAllDomaines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomaineMetierDTO> getDomaineById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getDomaineById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<DomaineMetierDTO>> rechercherDomaines(@RequestParam(required = false) String terme) {
        return ResponseEntity.ok(service.rechercherDomaines(terme));
    }

    @PostMapping
    public ResponseEntity<?> createDomaine(@RequestBody DomaineMetierDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.createDomaine(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDomaine(@PathVariable Long id, @RequestBody DomaineMetierDTO dto) {
        try {
            return ResponseEntity.ok(service.updateDomaine(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDomaine(@PathVariable Long id) {
        try {
            service.deleteDomaine(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== SOUS-DOMAINES MÉTIER ====================

    @GetMapping("/sous-domaines")
    public ResponseEntity<List<SousDomaineAvecDomaineDTO>> getAllSousDomaines() {
        return ResponseEntity.ok(service.getAllSousDomaines());
    }

    @GetMapping("/sous-domaines/{id}")
    public ResponseEntity<SousDomaineAvecDomaineDTO> getSousDomaineById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getSousDomaineById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{domaineId}/sous-domaines")
    public ResponseEntity<List<SousDomaineAvecDomaineDTO>> getSousDomainesByDomaineId(@PathVariable Long domaineId) {
        return ResponseEntity.ok(service.getSousDomainesByDomaineId(domaineId));
    }

    @GetMapping("/sous-domaines/recherche")
    public ResponseEntity<List<SousDomaineAvecDomaineDTO>> rechercherSousDomaines(@RequestParam(required = false) String terme) {
        return ResponseEntity.ok(service.rechercherSousDomaines(terme));
    }

    @PostMapping("/sous-domaines")
    public ResponseEntity<?> createSousDomaine(@RequestBody Map<String, Object> request) {
        try {
            Long domaineId = Long.valueOf(request.get("domaineId").toString());
            String code = request.get("code").toString();
            String libelle = request.get("libelle").toString();
            String description = request.getOrDefault("description", "").toString();
            Integer popularite = request.get("popularite") != null ?
                Integer.valueOf(request.get("popularite").toString()) : 0;

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createSousDomaine(domaineId, code, libelle, description, popularite));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/sous-domaines/{id}")
    public ResponseEntity<?> updateSousDomaine(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long domaineId = request.get("domaineId") != null ?
                Long.valueOf(request.get("domaineId").toString()) : null;
            String code = request.get("code").toString();
            String libelle = request.get("libelle").toString();
            String description = request.getOrDefault("description", "").toString();
            Integer popularite = request.get("popularite") != null ?
                Integer.valueOf(request.get("popularite").toString()) : 0;
            Boolean estActif = request.get("estActif") != null ?
                Boolean.valueOf(request.get("estActif").toString()) : true;

            return ResponseEntity.ok(service.updateSousDomaine(id, domaineId, code, libelle, description, popularite, estActif));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/sous-domaines/{id}")
    public ResponseEntity<?> deleteSousDomaine(@PathVariable Long id) {
        try {
            service.deleteSousDomaine(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
