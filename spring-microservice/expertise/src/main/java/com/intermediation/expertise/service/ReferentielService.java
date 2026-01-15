package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.*;
import com.intermediation.expertise.model.*;
import com.intermediation.expertise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReferentielService {

    private final DomaineCompetenceRepository domaineCompetenceRepository;
    private final DomaineMetierRepository domaineMetierRepository;
    private final SousDomaineMetierRepository sousDomaineMetierRepository;
    private final CritereEvaluationRepository critereEvaluationRepository;
    private final MethodeEvaluationRepository methodeEvaluationRepository;

    // ============= Domaines de Compétence =============

    public List<DomaineCompetenceDTO> getAllDomainesCompetence() {
        log.info("📚 Récupération de tous les domaines de compétence actifs");
        return domaineCompetenceRepository.findByEstActifTrueOrderByOrdreAffichage()
                .stream()
                .map(this::toDomaineCompetenceDTO)
                .collect(Collectors.toList());
    }

    public DomaineCompetenceDTO getDomaineCompetenceById(Long id) {
        log.info("📚 Récupération du domaine de compétence avec l'ID: {}", id);
        return domaineCompetenceRepository.findById(id)
                .map(this::toDomaineCompetenceDTO)
                .orElseThrow(() -> new RuntimeException("Domaine de compétence non trouvé avec l'ID: " + id));
    }

    private DomaineCompetenceDTO toDomaineCompetenceDTO(DomaineCompetence domaine) {
        return new DomaineCompetenceDTO(
                domaine.getId(),
                domaine.getCode(),
                domaine.getLibelle(),
                domaine.getDescription(),
                domaine.getOrdreAffichage(),
                domaine.getEstActif()
        );
    }

    // ============= Domaines Métier =============

    public List<DomaineMetierDTO> getAllDomainesMetier() {
        log.info("🏢 Récupération de tous les domaines métier actifs");
        return domaineMetierRepository.findByEstActifTrueOrderByPopulariteDesc()
                .stream()
                .map(this::toDomaineMetierDTO)
                .collect(Collectors.toList());
    }

    private DomaineMetierDTO toDomaineMetierDTO(DomaineMetier domaine) {
        return new DomaineMetierDTO(
                domaine.getId(),
                domaine.getCode(),
                domaine.getLibelle(),
                domaine.getDescription(),
                domaine.getIcone(),
                domaine.getCouleur(),
                domaine.getPopularite(),
                domaine.getEstActif()
        );
    }

    // ============= Sous-Domaines Métier =============

    public List<SousDomaineMetierDTO> getAllSousDomainesMetier() {
        log.info("📦 Récupération de tous les sous-domaines métier actifs");
        return sousDomaineMetierRepository.findByEstActifTrueOrderByPopulariteDesc()
                .stream()
                .map(this::toSousDomaineMetierDTO)
                .collect(Collectors.toList());
    }

    public List<SousDomaineMetierDTO> getSousDomainesMetierByDomaine(Long domaineMetierId) {
        log.info("📦 Récupération des sous-domaines métier pour le domaine {}", domaineMetierId);
        return sousDomaineMetierRepository.findByDomaineMetierIdAndEstActifTrueOrderByPopulariteDesc(domaineMetierId)
                .stream()
                .map(this::toSousDomaineMetierDTO)
                .collect(Collectors.toList());
    }

    private SousDomaineMetierDTO toSousDomaineMetierDTO(SousDomaineMetier sousDomaine) {
        return new SousDomaineMetierDTO(
                sousDomaine.getId(),
                sousDomaine.getDomaineMetier() != null ? sousDomaine.getDomaineMetier().getId() : null,
                sousDomaine.getCode(),
                sousDomaine.getLibelle(),
                sousDomaine.getDescription(),
                sousDomaine.getPopularite(),
                sousDomaine.getEstActif()
        );
    }

    // ============= Critères d'Évaluation =============

    public List<CritereEvaluationDTO> getAllCriteresEvaluation() {
        log.info("✅ Récupération de tous les critères d'évaluation actifs");
        return critereEvaluationRepository.findByEstActifTrue()
                .stream()
                .map(this::toCritereEvaluationDTO)
                .collect(Collectors.toList());
    }

    public List<CritereEvaluationDTO> getCriteresEvaluationByDomaine(Long domaineId) {
        log.info("✅ Récupération des critères d'évaluation pour le domaine {}", domaineId);
        return critereEvaluationRepository.findByDomaineIdAndEstActifTrue(domaineId)
                .stream()
                .map(this::toCritereEvaluationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CritereEvaluationDTO createCritereEvaluation(CritereEvaluationDTO dto) {
        log.info("➕ Création d'un nouveau critère d'évaluation: {}", dto.getLibelle());

        // Vérifier que le domaine existe
        DomaineCompetence domaine = domaineCompetenceRepository.findById(dto.getDomaineId())
                .orElseThrow(() -> new IllegalArgumentException("Domaine de compétence non trouvé avec l'ID: " + dto.getDomaineId()));

        // Vérifier l'unicité du code dans le domaine
        if (critereEvaluationRepository.existsByCodeAndDomaineId(dto.getCode(), dto.getDomaineId())) {
            throw new IllegalArgumentException("Un critère avec ce code existe déjà dans ce domaine");
        }

        CritereEvaluation critere = new CritereEvaluation();
        critere.setDomaine(domaine);
        critere.setCode(dto.getCode());
        critere.setLibelle(dto.getLibelle());
        critere.setDescription(dto.getDescription());
        critere.setEstActif(dto.getEstActif() != null ? dto.getEstActif() : true);

        // Associer les méthodes d'évaluation
        if (dto.getMethodeIds() != null && !dto.getMethodeIds().isEmpty()) {
            Set<MethodeEvaluation> methodes = new HashSet<>();
            for (Long methodeId : dto.getMethodeIds()) {
                MethodeEvaluation methode = methodeEvaluationRepository.findById(methodeId)
                        .orElseThrow(() -> new IllegalArgumentException("Méthode d'évaluation non trouvée avec l'ID: " + methodeId));
                methodes.add(methode);
            }
            critere.setMethodes(methodes);
        }

        CritereEvaluation saved = critereEvaluationRepository.save(critere);
        log.info("✅ Critère d'évaluation créé avec succès: ID={}", saved.getId());

        return toCritereEvaluationDTO(saved);
    }

    @Transactional
    public CritereEvaluationDTO updateCritereEvaluation(Long id, CritereEvaluationDTO dto) {
        log.info("✏️ Mise à jour du critère d'évaluation ID={}", id);

        CritereEvaluation critere = critereEvaluationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Critère d'évaluation non trouvé avec l'ID: " + id));

        // Vérifier l'unicité du code si changé
        if (!critere.getCode().equals(dto.getCode())) {
            if (critereEvaluationRepository.existsByCodeAndDomaineId(dto.getCode(), dto.getDomaineId())) {
                throw new IllegalArgumentException("Un critère avec ce code existe déjà dans ce domaine");
            }
        }

        // Mise à jour du domaine si changé
        if (!critere.getDomaine().getId().equals(dto.getDomaineId())) {
            DomaineCompetence domaine = domaineCompetenceRepository.findById(dto.getDomaineId())
                    .orElseThrow(() -> new IllegalArgumentException("Domaine de compétence non trouvé avec l'ID: " + dto.getDomaineId()));
            critere.setDomaine(domaine);
        }

        critere.setCode(dto.getCode());
        critere.setLibelle(dto.getLibelle());
        critere.setDescription(dto.getDescription());
        critere.setEstActif(dto.getEstActif());

        // Mettre à jour les méthodes d'évaluation
        critere.getMethodes().clear();
        if (dto.getMethodeIds() != null && !dto.getMethodeIds().isEmpty()) {
            Set<MethodeEvaluation> methodes = new HashSet<>();
            for (Long methodeId : dto.getMethodeIds()) {
                MethodeEvaluation methode = methodeEvaluationRepository.findById(methodeId)
                        .orElseThrow(() -> new IllegalArgumentException("Méthode d'évaluation non trouvée avec l'ID: " + methodeId));
                methodes.add(methode);
            }
            critere.setMethodes(methodes);
        }

        CritereEvaluation updated = critereEvaluationRepository.save(critere);
        log.info("✅ Critère d'évaluation mis à jour avec succès: ID={}", updated.getId());

        return toCritereEvaluationDTO(updated);
    }

    @Transactional
    public void deleteCritereEvaluation(Long id) {
        log.info("🗑️ Suppression du critère d'évaluation ID={}", id);

        CritereEvaluation critere = critereEvaluationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Critère d'évaluation non trouvé avec l'ID: " + id));

        // Soft delete
        critere.setEstActif(false);
        critereEvaluationRepository.save(critere);

        log.info("✅ Critère d'évaluation désactivé avec succès: ID={}", id);
    }

    private CritereEvaluationDTO toCritereEvaluationDTO(CritereEvaluation critere) {
        Set<Long> methodeIds = critere.getMethodes() != null
                ? critere.getMethodes().stream()
                    .map(MethodeEvaluation::getId)
                    .collect(Collectors.toSet())
                : new HashSet<>();

        return new CritereEvaluationDTO(
                critere.getId(),
                critere.getDomaine() != null ? critere.getDomaine().getId() : null,
                critere.getCode(),
                critere.getLibelle(),
                critere.getDescription(),
                critere.getEstActif(),
                methodeIds
        );
    }

    // ============= Méthodes d'Évaluation =============

    public List<MethodeEvaluationDTO> getAllMethodesEvaluation() {
        log.info("🔬 Récupération de toutes les méthodes d'évaluation actives");
        return methodeEvaluationRepository.findByEstActifTrue()
                .stream()
                .map(this::toMethodeEvaluationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MethodeEvaluationDTO createMethodeEvaluation(MethodeEvaluationDTO dto) {
        log.info("➕ Création d'une nouvelle méthode d'évaluation: {}", dto.getLibelle());

        // Vérifier l'unicité du code
        if (methodeEvaluationRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Une méthode avec ce code existe déjà");
        }

        MethodeEvaluation methode = new MethodeEvaluation();
        methode.setCode(dto.getCode());
        methode.setLibelle(dto.getLibelle());
        methode.setDescription(dto.getDescription());
        methode.setTypeMethode(dto.getTypeMethode());
        methode.setEstActif(dto.getEstActif() != null ? dto.getEstActif() : true);

        MethodeEvaluation saved = methodeEvaluationRepository.save(methode);
        log.info("✅ Méthode d'évaluation créée avec succès: ID={}", saved.getId());

        return toMethodeEvaluationDTO(saved);
    }

    @Transactional
    public MethodeEvaluationDTO updateMethodeEvaluation(Long id, MethodeEvaluationDTO dto) {
        log.info("✏️ Mise à jour de la méthode d'évaluation ID={}", id);

        MethodeEvaluation methode = methodeEvaluationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Méthode d'évaluation non trouvée avec l'ID: " + id));

        // Vérifier l'unicité du code si changé
        if (!methode.getCode().equals(dto.getCode())) {
            if (methodeEvaluationRepository.existsByCode(dto.getCode())) {
                throw new IllegalArgumentException("Une méthode avec ce code existe déjà");
            }
        }

        methode.setCode(dto.getCode());
        methode.setLibelle(dto.getLibelle());
        methode.setDescription(dto.getDescription());
        methode.setTypeMethode(dto.getTypeMethode());
        methode.setEstActif(dto.getEstActif());

        MethodeEvaluation updated = methodeEvaluationRepository.save(methode);
        log.info("✅ Méthode d'évaluation mise à jour avec succès: ID={}", updated.getId());

        return toMethodeEvaluationDTO(updated);
    }

    @Transactional
    public void deleteMethodeEvaluation(Long id) {
        log.info("🗑️ Suppression de la méthode d'évaluation ID={}", id);

        MethodeEvaluation methode = methodeEvaluationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Méthode d'évaluation non trouvée avec l'ID: " + id));

        // Soft delete
        methode.setEstActif(false);
        methodeEvaluationRepository.save(methode);

        log.info("✅ Méthode d'évaluation désactivée avec succès: ID={}", id);
    }

    private MethodeEvaluationDTO toMethodeEvaluationDTO(MethodeEvaluation methode) {
        return new MethodeEvaluationDTO(
                methode.getId(),
                methode.getCode(),
                methode.getLibelle(),
                methode.getDescription(),
                methode.getTypeMethode(),
                methode.getEstActif()
        );
    }
}
