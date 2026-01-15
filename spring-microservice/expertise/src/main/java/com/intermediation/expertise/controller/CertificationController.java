package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.CertificationDTO;
import com.intermediation.expertise.service.CertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des certifications
 */
@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CertificationController {
    
    private final CertificationService service;
    
    /**
     * Récupère toutes les certifications actives
     * GET /api/certifications
     */
    @GetMapping
    public ResponseEntity<List<CertificationDTO>> getAllCertifications() {
        return ResponseEntity.ok(service.getAllCertifications());
    }
    
    /**
     * Récupère une certification par ID
     * GET /api/certifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CertificationDTO> getCertificationById(@PathVariable Long id) {
        CertificationDTO certification = service.getCertificationById(id);
        if (certification == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(certification);
    }
    
    /**
     * Recherche des certifications par intitulé
     * GET /api/certifications/recherche?terme=AWS
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<CertificationDTO>> rechercherCertifications(
        @RequestParam(required = false) String terme
    ) {
        return ResponseEntity.ok(service.rechercherCertifications(terme));
    }
    
    /**
     * Récupère les certifications les plus populaires
     * GET /api/certifications/populaires?limit=10
     */
    @GetMapping("/populaires")
    public ResponseEntity<List<CertificationDTO>> getCertificationsPopulaires(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(service.getCertificationsPopulaires(limit));
    }
    
    /**
     * Récupère les statistiques
     * GET /api/certifications/statistiques
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(service.getStatistiques());
    }
    
    /**
     * Crée une nouvelle certification
     * POST /api/certifications
     */
    @PostMapping
    public ResponseEntity<CertificationDTO> createCertification(@RequestBody CertificationDTO dto) {
        try {
            CertificationDTO created = service.createCertification(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Met à jour une certification existante
     * PUT /api/certifications/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CertificationDTO> updateCertification(
        @PathVariable Long id,
        @RequestBody CertificationDTO dto
    ) {
        try {
            CertificationDTO updated = service.updateCertification(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Supprime une certification
     * DELETE /api/certifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertification(@PathVariable Long id) {
        try {
            service.deleteCertification(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Incrémente la popularité d'une certification
     * POST /api/certifications/{id}/utiliser
     */
    @PostMapping("/{id}/utiliser")
    public ResponseEntity<Void> utiliserCertification(@PathVariable Long id) {
        try {
            service.incrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Décrémente la popularité d'une certification
     * POST /api/certifications/{id}/retirer
     */
    @PostMapping("/{id}/retirer")
    public ResponseEntity<Void> retirerCertification(@PathVariable Long id) {
        try {
            service.decrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
