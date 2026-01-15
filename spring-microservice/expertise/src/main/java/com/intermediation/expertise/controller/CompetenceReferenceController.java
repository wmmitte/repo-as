package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.CompetenceReferenceDTO;
import com.intermediation.expertise.service.CompetenceReferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion du référentiel de compétences
 */
@RestController
@RequestMapping("/api/competences-reference")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompetenceReferenceController {
    
    private final CompetenceReferenceService service;
    
    /**
     * Récupère toutes les compétences de référence
     * GET /api/competences-reference?includeInactive=true
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping
    public ResponseEntity<List<CompetenceReferenceDTO>> getAllCompetences(
        @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return ResponseEntity.ok(service.getAllCompetences(includeInactive));
    }
    
    /**
     * Récupère une compétence par ID
     * GET /api/competences-reference/{id}
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompetenceReferenceDTO> getCompetenceById(@PathVariable Long id) {
        CompetenceReferenceDTO competence = service.getCompetenceById(id);
        if (competence == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(competence);
    }

    /**
     * Récupère une compétence par code
     * GET /api/competences-reference/code/{code}
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<CompetenceReferenceDTO> getCompetenceByCode(@PathVariable String code) {
        CompetenceReferenceDTO competence = service.getCompetenceByCode(code);
        if (competence == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(competence);
    }

    /**
     * Recherche de compétences par terme
     * GET /api/competences-reference/recherche?terme=java
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<CompetenceReferenceDTO>> rechercherParTerme(
        @RequestParam String terme
    ) {
        return ResponseEntity.ok(service.rechercherParTerme(terme));
    }
    
    /**
     * Recherche avancée multi-critères
     * GET /api/competences-reference/recherche-avancee?domaine=Technique&sousDomaine=Développement&typeCompetence=SAVOIR_FAIRE
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/recherche-avancee")
    public ResponseEntity<List<CompetenceReferenceDTO>> rechercheAvancee(
        @RequestParam(required = false) String domaine,
        @RequestParam(required = false) String sousDomaine,
        @RequestParam(required = false) String typeCompetence
    ) {
        return ResponseEntity.ok(service.rechercheAvancee(domaine, sousDomaine, typeCompetence));
    }

    /**
     * Récupère les compétences par domaine
     * GET /api/competences-reference/domaine/{domaine}
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/domaine/{domaine}")
    public ResponseEntity<List<CompetenceReferenceDTO>> getCompetencesByDomaine(
        @PathVariable String domaine
    ) {
        return ResponseEntity.ok(service.getCompetencesByDomaine(domaine));
    }

    /**
     * Récupère l'arborescence des compétences
     * GET /api/competences-reference/arborescence
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/arborescence")
    public ResponseEntity<List<CompetenceReferenceDTO>> getArborescence() {
        return ResponseEntity.ok(service.getCompetencesRacines());
    }

    /**
     * Récupère les compétences les plus populaires
     * GET /api/competences-reference/populaires?limit=10
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/populaires")
    public ResponseEntity<List<CompetenceReferenceDTO>> getCompetencesPopulaires(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(service.getCompetencesPopulaires(limit));
    }

    /**
     * Récupère tous les domaines
     * GET /api/competences-reference/domaines
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/domaines")
    public ResponseEntity<List<String>> getAllDomaines() {
        return ResponseEntity.ok(service.getAllDomaines());
    }

    /**
     * Récupère les sous-domaines d'un domaine
     * GET /api/competences-reference/domaines/{domaine}/sous-domaines
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/domaines/{domaine}/sous-domaines")
    public ResponseEntity<List<String>> getSousDomainesByDomaine(@PathVariable String domaine) {
        return ResponseEntity.ok(service.getSousDomainesByDomaine(domaine));
    }

    /**
     * Récupère les statistiques par domaine
     * GET /api/competences-reference/statistiques
     * Accessible à tous les rôles (expert, rh, manager)
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Long>> getStatistiques() {
        return ResponseEntity.ok(service.getStatistiquesByDomaine());
    }
    
    /**
     * Crée une nouvelle compétence de référence
     * POST /api/competences-reference
     * Réservé au rôle Manager uniquement
     */
    @PostMapping
    public ResponseEntity<CompetenceReferenceDTO> creerCompetence(
        @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
        @RequestBody CompetenceReferenceDTO dto
    ) {
        // Vérification de l'authentification
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            CompetenceReferenceDTO created = service.creerCompetence(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Met à jour une compétence existante
     * PUT /api/competences-reference/{id}
     * Réservé au rôle Manager uniquement
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompetenceReferenceDTO> updateCompetence(
        @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
        @PathVariable Long id,
        @RequestBody CompetenceReferenceDTO dto
    ) {
        // Vérification de l'authentification
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            CompetenceReferenceDTO updated = service.updateCompetence(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Supprime (désactive) une compétence
     * DELETE /api/competences-reference/{id}
     * Réservé au rôle Manager uniquement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetence(
        @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
        @PathVariable Long id
    ) {
        // Vérification de l'authentification
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            service.deleteCompetence(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Incrémente la popularité d'une compétence (appelé quand un utilisateur l'utilise)
     * POST /api/competences-reference/{id}/utiliser
     * Accessible à tous les rôles authentifiés (expert, rh, manager)
     */
    @PostMapping("/{id}/utiliser")
    public ResponseEntity<Void> utiliserCompetence(@PathVariable Long id) {
        try {
            service.incrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Décrémente la popularité d'une compétence (appelé quand un utilisateur change de compétence)
     * POST /api/competences-reference/{id}/retirer
     * Accessible à tous les rôles authentifiés (expert, rh, manager)
     */
    @PostMapping("/{id}/retirer")
    public ResponseEntity<Void> retirerCompetence(@PathVariable Long id) {
        try {
            service.decrementerPopularite(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Importe des compétences en masse
     * POST /api/competences-reference/import
     * Réservé au rôle Manager uniquement
     */
    @PostMapping("/import")
    public ResponseEntity<List<CompetenceReferenceDTO>> importerCompetences(
        @RequestBody List<CompetenceReferenceDTO> competences
    ) {
        List<CompetenceReferenceDTO> imported = service.importerCompetences(competences);
        return ResponseEntity.ok(imported);
    }
}


