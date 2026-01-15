package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.PaysDTO;
import com.intermediation.expertise.dto.VilleAvecPaysDTO;
import com.intermediation.expertise.dto.VilleDTO;
import com.intermediation.expertise.service.LocalisationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des localisations (pays et villes)
 */
@RestController
@RequestMapping("/api/localisations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocalisationController {
    
    private final LocalisationService service;
    
    // ==================== PAYS ====================
    
    @GetMapping("/pays")
    public ResponseEntity<List<PaysDTO>> getAllPays() {
        return ResponseEntity.ok(service.getAllPays());
    }
    
    @GetMapping("/pays/{id}")
    public ResponseEntity<PaysDTO> getPaysById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getPaysById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/pays/recherche")
    public ResponseEntity<List<PaysDTO>> rechercherPays(@RequestParam(required = false) String terme) {
        return ResponseEntity.ok(service.rechercherPays(terme));
    }
    
    @PostMapping("/pays")
    public ResponseEntity<PaysDTO> createPays(@RequestBody PaysDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.createPays(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/pays/{id}")
    public ResponseEntity<PaysDTO> updatePays(@PathVariable Long id, @RequestBody PaysDTO dto) {
        try {
            return ResponseEntity.ok(service.updatePays(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/pays/{id}")
    public ResponseEntity<Void> deletePays(@PathVariable Long id) {
        try {
            service.deletePays(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==================== VILLES ====================
    
    @GetMapping("/villes")
    public ResponseEntity<List<VilleDTO>> getAllVilles() {
        return ResponseEntity.ok(service.getAllVilles());
    }
    
    @GetMapping("/villes/{id}")
    public ResponseEntity<VilleDTO> getVilleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getVilleById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/villes/pays/{paysId}")
    public ResponseEntity<List<VilleDTO>> getVillesByPaysId(@PathVariable Long paysId) {
        return ResponseEntity.ok(service.getVillesByPaysId(paysId));
    }
    
    @PostMapping("/villes")
    public ResponseEntity<VilleDTO> createVille(@RequestBody VilleDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.createVille(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/villes/{id}")
    public ResponseEntity<VilleDTO> updateVille(@PathVariable Long id, @RequestBody VilleDTO dto) {
        try {
            return ResponseEntity.ok(service.updateVille(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/villes/{id}")
    public ResponseEntity<Void> deleteVille(@PathVariable Long id) {
        try {
            service.deleteVille(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==================== RECHERCHE & POPULARITÉ ====================
    
    /**
     * Recherche combinée ville + pays (pour l'autocomplete)
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<VilleAvecPaysDTO>> rechercherLocalisations(
        @RequestParam(required = false) String terme
    ) {
        return ResponseEntity.ok(service.rechercherLocalisations(terme));
    }
    
    /**
     * Récupère les villes les plus populaires
     */
    @GetMapping("/populaires")
    public ResponseEntity<List<VilleAvecPaysDTO>> getVillesPopulaires(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(service.getVillesPopulaires(limit));
    }
    
    /**
     * Incrémente la popularité d'une ville
     */
    @PostMapping("/villes/{id}/utiliser")
    public ResponseEntity<Void> utiliserVille(@PathVariable Long id) {
        try {
            service.incrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Décrémente la popularité d'une ville
     */
    @PostMapping("/villes/{id}/retirer")
    public ResponseEntity<Void> retirerVille(@PathVariable Long id) {
        try {
            service.decrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Récupère les statistiques
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(service.getStatistiques());
    }
}
