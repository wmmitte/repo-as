package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.service.ReferentielService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referentiels")
@RequiredArgsConstructor
@Slf4j
public class ReferentielController {

    private final ReferentielService referentielService;

    // ============= Domaines de Compétence =============

    @GetMapping("/domaines-competence")
    public ResponseEntity<List<DomaineCompetenceDTO>> getAllDomainesCompetence() {
        log.info("📚 GET /api/referentiels/domaines-competence");
        List<DomaineCompetenceDTO> domaines = referentielService.getAllDomainesCompetence();
        return ResponseEntity.ok(domaines);
    }

    @GetMapping("/domaines-competence/{id}")
    public ResponseEntity<DomaineCompetenceDTO> getDomaineCompetenceById(@PathVariable Long id) {
        log.info("📚 GET /api/referentiels/domaines-competence/{}", id);
        DomaineCompetenceDTO domaine = referentielService.getDomaineCompetenceById(id);
        return ResponseEntity.ok(domaine);
    }

    // ============= Domaines Métier =============

    @GetMapping("/domaines-metier")
    public ResponseEntity<List<DomaineMetierDTO>> getAllDomainesMetier() {
        log.info("🏢 GET /api/referentiels/domaines-metier");
        List<DomaineMetierDTO> domaines = referentielService.getAllDomainesMetier();
        return ResponseEntity.ok(domaines);
    }

    // ============= Sous-Domaines Métier =============

    @GetMapping("/sous-domaines-metier")
    public ResponseEntity<List<SousDomaineMetierDTO>> getSousDomainesMetier(
            @RequestParam(required = false) Long domaineMetierId
    ) {
        log.info("📦 GET /api/referentiels/sous-domaines-metier?domaineMetierId={}", domaineMetierId);

        List<SousDomaineMetierDTO> sousDomaines;
        if (domaineMetierId != null) {
            sousDomaines = referentielService.getSousDomainesMetierByDomaine(domaineMetierId);
        } else {
            sousDomaines = referentielService.getAllSousDomainesMetier();
        }

        return ResponseEntity.ok(sousDomaines);
    }

    // ============= Critères d'Évaluation =============

    @GetMapping("/criteres-evaluation")
    public ResponseEntity<List<CritereEvaluationDTO>> getCriteresEvaluation(
            @RequestParam(required = false) Long domaineId
    ) {
        log.info("✅ GET /api/referentiels/criteres-evaluation?domaineId={}", domaineId);

        List<CritereEvaluationDTO> criteres;
        if (domaineId != null) {
            criteres = referentielService.getCriteresEvaluationByDomaine(domaineId);
        } else {
            criteres = referentielService.getAllCriteresEvaluation();
        }

        return ResponseEntity.ok(criteres);
    }

    @PostMapping("/criteres-evaluation")
    public ResponseEntity<CritereEvaluationDTO> createCritereEvaluation(
            @RequestBody CritereEvaluationDTO dto
    ) {
        log.info("➕ POST /api/referentiels/criteres-evaluation - Création: {}", dto.getLibelle());

        try {
            CritereEvaluationDTO created = referentielService.createCritereEvaluation(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la création: {}", e.getMessage());
            throw e;
        }
    }

    @PutMapping("/criteres-evaluation/{id}")
    public ResponseEntity<CritereEvaluationDTO> updateCritereEvaluation(
            @PathVariable Long id,
            @RequestBody CritereEvaluationDTO dto
    ) {
        log.info("✏️ PUT /api/referentiels/criteres-evaluation/{} - Mise à jour: {}", id, dto.getLibelle());

        try {
            CritereEvaluationDTO updated = referentielService.updateCritereEvaluation(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la mise à jour: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/criteres-evaluation/{id}")
    public ResponseEntity<Void> deleteCritereEvaluation(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/referentiels/criteres-evaluation/{}", id);

        try {
            referentielService.deleteCritereEvaluation(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la suppression: {}", e.getMessage());
            throw e;
        }
    }

    // ============= Méthodes d'Évaluation =============

    @GetMapping("/methodes-evaluation")
    public ResponseEntity<List<MethodeEvaluationDTO>> getMethodesEvaluation() {
        log.info("🔬 GET /api/referentiels/methodes-evaluation");
        List<MethodeEvaluationDTO> methodes = referentielService.getAllMethodesEvaluation();
        return ResponseEntity.ok(methodes);
    }

    @PostMapping("/methodes-evaluation")
    public ResponseEntity<MethodeEvaluationDTO> createMethodeEvaluation(
            @RequestBody MethodeEvaluationDTO dto
    ) {
        log.info("➕ POST /api/referentiels/methodes-evaluation - Création: {}", dto.getLibelle());

        try {
            MethodeEvaluationDTO created = referentielService.createMethodeEvaluation(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la création: {}", e.getMessage());
            throw e;
        }
    }

    @PutMapping("/methodes-evaluation/{id}")
    public ResponseEntity<MethodeEvaluationDTO> updateMethodeEvaluation(
            @PathVariable Long id,
            @RequestBody MethodeEvaluationDTO dto
    ) {
        log.info("✏️ PUT /api/referentiels/methodes-evaluation/{} - Mise à jour: {}", id, dto.getLibelle());

        try {
            MethodeEvaluationDTO updated = referentielService.updateMethodeEvaluation(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la mise à jour: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/methodes-evaluation/{id}")
    public ResponseEntity<Void> deleteMethodeEvaluation(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/referentiels/methodes-evaluation/{}", id);

        try {
            referentielService.deleteMethodeEvaluation(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur lors de la suppression: {}", e.getMessage());
            throw e;
        }
    }
}
